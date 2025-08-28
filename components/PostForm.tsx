'use client'

{/*import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useUser } from "@clerk/nextjs"
import { Button } from "./ui/button";
import { ImageIcon, XIcon } from "lucide-react";
import { useRef, useState } from "react";

function PostForm() {

  const ref = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  }

  const {user} = useUser();
  return (
    <div className="mb-2">
      <form ref = {ref} action="" className="p-3 bg-[#18181b] rounded-lg border border-[#3f3f46]">
        <div className="flex items-center space-x-2">
          <Avatar>
            <AvatarImage src={user?.imageUrl} />
            <AvatarFallback>
              {user?.firstName?.charAt(0)}
              {user?.lastName?.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <input 
          
          type="text"
          name="postInput"
          placeholder="Start writing a post..."
          className="flex-1 outline-none rounded-full py-3 px-4 border bg-transparent text-[#f4f4f5] placeholder-[#a1a1aa]" />
          <input
           type="file" name="image" accept="image/*" hidden
           ref={fileInputRef}
           onChange={handleImageChange}/>
          
          <button type="submit" className="bg-[#27272a] text-white hover:bg-[#3f3f43]" hidden>
            Post
          </button>
        </div>

        {preview && (
          <div className="mt-3">
            <img src={preview} alt="Preview" className="w-full object-cover" />
          </div>

        )}

        <div className="flex justify-end mt-2 space-x-2">
          <Button className="bg-[#3f3f46] text-[#d4d4d8] hover:bg-[#52525b]" type="button" onClick={() => fileInputRef.current?.click()}>
            <ImageIcon className="mr-2" size={16} color="currentColor"/>
            {preview ? "Change" : "Add"} image
          </Button>

          {preview && (
            <Button className="bg-[#3f3f46] text-[#d4d4d8] hover:bg-[#52525b]" type="button" onClick={() => setPreview(null)}>
              <XIcon className="mr-2" size={16} color="currentColor" />
              Delete Image
            </Button>
          )}
        </div>
      </form>

        <hr className="w-full border-[#3f3f46] my-4" />
    </div>
  )
}

export default PostForm

// rfce

{/*         <div>
          <Avatar>
            <AvatarImage src={user?.imageUrl} />
            <AvatarFallback>
              {user?.firstName?.charAt(0)}
              {user?.lastName?.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </div> /}

        */}


import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useUser } from "@clerk/nextjs"
import { Button } from "./ui/button";
import { ImageIcon, XIcon, PenSquare } from "lucide-react";
import { useRef, useState } from "react";
import createPostAction from "@/actions/createPostAction";

function PostForm() {

  const ref = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  }

  const handlePostAction = async (formData: FormData) => {
    const formDataCopy = formData;
    ref.current?.reset();

    const text = formDataCopy.get("postInput") as string;

    if (!text.trim()){
      throw new Error("You must provide an input to post")
    }

    setPreview(null);

    try{
      await createPostAction(formDataCopy)
    }catch (error) {
      console.log("Error creating post : ", error)
    }
  }

  const { user } = useUser();
  return (
    <div className="mb-2">
      <form 
        ref={ref} 
        action={(formData) => {
          handlePostAction(formData);
        }} 
        className="p-3 bg-[#18181b] rounded-lg border border-[#3f3f46]"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <PenSquare className="text-[#a1a1aa]" size={18} />
            <h2 className="text-sm font-medium text-[#e4e4e7]">Create a Post</h2>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Avatar>
            <AvatarImage src={user?.imageUrl} />
            <AvatarFallback>
              {user?.firstName?.charAt(0)}
              {user?.lastName?.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <input 
            type="text"
            name="postInput"
            placeholder="Start writing a post..."
            className="flex-1 outline-none rounded-full py-3 px-2 border bg-transparent text-[#f4f4f5] placeholder-[#a1a1aa]" 
          />
          <input
            type="file" 
            name="image" 
            accept="image/*" 
            hidden
            ref={fileInputRef}
            onChange={handleImageChange}
          />
          
          <button 
            type="submit" 
            className="bg-[#27272a] text-white hover:bg-[#3f3f43]" 
            hidden
          >
            Post
          </button>
        </div>

        {preview && (
          <div className="mt-3">
            <img 
              src={preview} 
              alt="Preview" 
              className="w-full object-cover rounded-md border border-[#3f3f46]" 
            />
          </div>
        )}

        <div className="flex justify-end mt-2 space-x-2">
          <Button 
            className="bg-[#3f3f46] text-[#d4d4d8] hover:bg-[#52525b]" 
            type="button" 
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon className="mr-2" size={16} color="currentColor"/>
            {preview ? "Change" : "Add"} image
          </Button>

          {preview && (
            <Button 
              className="bg-[#3f3f46] text-[#d4d4d8] hover:bg-[#52525b]" 
              type="button" 
              onClick={() => setPreview(null)}
            >
              <XIcon className="mr-2" size={16} color="currentColor" />
              Delete Image
            </Button>
          )}
        </div>
      </form>

      <hr className="w-full border-[#3f3f46] my-4" />
    </div>
  )
}

export default PostForm


