import { getPosts } from "@/app/actions/post";
import { getStories } from "@/app/actions/story";
import FeedClient from "./FeedClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";

export const dynamic = "force-dynamic";

export default async function FeedPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user?.email) {
    redirect("/login");
  }

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      friendRequestsSent: { 
        where: { status: "ACCEPTED" }, 
        include: { friend: { select: { id: true, name: true, image: true } } } 
      },
      friendRequestsReceived: { 
        where: { status: "ACCEPTED" }, 
        include: { user: { select: { id: true, name: true, image: true } } } 
      },
    }
  });

  if (!currentUser) {
    redirect("/login");
  }

  const friends = [
    ...currentUser.friendRequestsSent.map(f => f.friend),
    ...currentUser.friendRequestsReceived.map(f => f.user)
  ];

  const posts = await getPosts();
  const stories = await getStories();

  const userBasic = {
    id: currentUser.id,
    name: currentUser.name,
    image: currentUser.image,
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-[#18191A] font-sans antialiased text-[#050505] dark:text-[#E4E6EB]">
      <Navbar currentUser={userBasic} />
      <div className="flex justify-between w-full max-w-[1920px] mx-auto">
        {/* Left Navigation Sidebar */}
        <LeftSidebar currentUser={userBasic} />

        {/* Center Main Feed */}
        <div className="flex-1 max-w-[680px] mx-auto min-w-0">
          <FeedClient 
            initialPosts={posts as any} 
            currentUser={userBasic} 
            initialStories={stories} 
          />
        </div>

        {/* Right Contacts / Sponsored Sidebar */}
        <RightSidebar friends={friends} />
      </div>
    </div>
  );
}
