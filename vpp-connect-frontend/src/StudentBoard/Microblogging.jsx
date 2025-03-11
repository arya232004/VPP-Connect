import { useState, useRef, useEffect } from "react";
import { Editor } from "@tinymce/tinymce-react";
// import VppHeader from "../components/VppHeader";
import VPPHeader from "../pages/VPPHeader";
import axios from "axios";

import {
  Ellipsis,
  Verified,
  ThumbsUp,
  MessageCircle,
  SquarePen,
  Plus,
  Key,
  Trash,
} from "lucide-react";
import { useAuth } from "../AuthContext";

const Microblogging = () => {
  const editorRef = useRef(null);
  const [posts, setPosts] = useState([]);
  const [charCount, setCharCount] = useState(0);
  const characterLimit = 300;
  const [content, setContent] = useState("");
  const { user } = useAuth()

  // Handle Like Button Click
  const handleLike = (id, likes) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id === id) {
          const isLiked = post.likes.includes(user.userId);
          if (isLiked) {
            // User already liked, so remove the like
            removelike(id); // Call removelike function if it's already liked
          } else {
            // User is liking the post, so call addlike function
            addlike(id);
          }
          return {
            ...post,
            liked: !isLiked, // Toggle the 'liked' state
            likes: isLiked
              ? post.likes.filter((userId) => userId !== user.userId) // Remove user ID if already liked
              : [...post.likes, user.userId], // Add user ID if not liked
          };
        }
        return post;
      })
    );
  };
  

  async function removelike(id){
    try{
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/microblogs/${id}/unlike`,
        {
          "userId": user.userId,
        }
      );
      console.log(response.data);
    }
    catch (error) {
      console.error(error);
    
    }
  }
  

  async function uploadmicroblog(obj) {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/microblogs`,
        obj
      );
      console.log(response.data);
      return response.data.id;
    } catch (error) {
      console.error(error);
    }
  }
  useEffect(() => {
    console.log(user);
  }, [user]);

  async function getmicroblogs() {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/api/microblogs`
      );
  
      // Sort the posts by timestamp in descending order
      const sortedPosts = response.data.sort(
        (a, b) => b.timestamp._seconds - a.timestamp._seconds
      );
      console.log(sortedPosts);
      setPosts(sortedPosts); // Update state with sorted posts
    } catch (error) {
      console.error(error);
    }
  }

  async function addlike(id) {
    try{
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/microblogs/${id}/like`,
        {
          "userId": user.userId,
        }
      );
      console.log(response.data);

    }
    catch (error) {
      console.error(error);
    
    }
  }
  
  useEffect(() => {
    getmicroblogs();
  }, []);


  // Handle Editor Change
  const handleEditorChange = (content, editor) => {
    setContent(content);
    setCharCount(content.replace(/<[^>]*>/g, "").length);
  };

  async function deletemicroblog(postid) {
    console.log(postid);
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_SERVER_URL}/api/microblogs/${postid}`, {
          params: { userId: user.userId }, // Send userId as query parameter
        }
      );
      console.log(response.data);
      setPosts(posts.filter((post) => post.id !== postid));
    } catch (error) {
      console.error(error);
    }
  }
  
  

  // Handle Post Submission
  const handlePost = async() => {
    if (editorRef.current) {
      const content = editorRef.current.getContent();
      // check total characters in content

      if (content.trim() === "") return;

      // Extract images from content
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = content;
      const images = Array.from(tempDiv.getElementsByTagName("img")).map(
        (img) => img.src
      );

      // Remove images from the content
      images.forEach((img) => {
        tempDiv.querySelector(`img[src="${img}"]`)?.remove();
      });

      const newPost = {
        userId: user.userId,
        content: content,
        username: user.fullname,
        profilePic: user.profilePic,
        // images: images,
        likes: []
      };

      console.log(newPost);
      const res = await uploadmicroblog({
        userId: user.userId,
        content: content,
      });
      console.log(res);
      newPost.id = res;
      setPosts((prevPosts) => [newPost, ...prevPosts]);
  
      editorRef.current.setContent(""); // Clear editor after posting
      setCharCount(0);
    }
  };

  return (
    <div>
      <VPPHeader text="Microblogging" />

      {/* TinyMCE Editor */}
      <div className="bg-white p-6 rounded-lg mb-4">
        <Editor
          apiKey="68mbfete8wjgeo0aa2xgdagb7b5u8x37y8ik56ub5ihq9420"
          onInit={(evt, editor) => (editorRef.current = editor)}
          initialValue=""
          init={{
            height: 200,
            menubar: false,
            branding: false,
            statusbar: false,
            plugins: "lists link image emoticons",
            toolbar:
              "undo redo | bold italic underline | bullist numlist | link image emoticons",
            placeholder: "What's happening?", // Set placeholder text here
          }}
          onEditorChange={handleEditorChange}
        />

        <div className="flex justify-between mt-2">
          <span
            className={`text-sm ${
              charCount > characterLimit ? "text-red-500" : "text-gray-500"
            }`}
          >
            {charCount} / {characterLimit} characters
          </span>
          <button
            onClick={handlePost}
            className="mt-3 bg-purple-600 text-white px-4 py-2 rounded-lg bg:[#8200db]"
            disabled={charCount === 0 || charCount > characterLimit}
          >
            Post
          </button>
        </div>
      </div>

      {/* Display Posts */}
      {posts.map((post, key) => (
        <div key={post.id} className="bg-white p-6 rounded-lg mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center mb-2">
              {post?.profilePic ? (
                <img
                  src={`${
                    import.meta.env.VITE_SERVER_URL
                  }/api/users/profile?url=${post.profilePic}`}
                  alt="Profile"
                  className="w-10 h-10 rounded-full"
                  loading="eager"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-300" />
              )}
              {/* <img src={`${import.meta.env.VITE_SERVER_URL}/api/users/profile?url=${post?.profilePic}`} alt="Profile" className="w-10 h-10 rounded-full" loading="eager"/> */}
              {/* <div className="w-10 h-10 bg-vppgreen text-white flex items-center justify-center rounded-full text-xl" 
              style={}
              >
              </div> */}
              <span className="ml-2 text-xl underline font-neueMedium">
                {post.username} {/* Display the username */}
              </span>
              <Verified size={20} className="ml-1" />
            </div>
            {post.userId === user.userId && (
              <Trash size={20}  onClick={() => deletemicroblog(post.id)}/>
            )}
          </div>

          <div
            className="text-gray-800"
            dangerouslySetInnerHTML={{ __html: post.content }} // Display content
          />

          {/* Like & Comment Buttons */}
          <div className="mt-3 flex items-center gap-6">
            <button
              onClick={() => handleLike(post.id)}
              className="flex items-center gap-1 text-gray-600 hover:text-purple-600"
            >
              <ThumbsUp
                size={20}
                className={
                  post.liked || post.likes.includes(user?.userId)
                    ? "text-purple-600"
                    : ""
                }
              />
              <span>{post.likes.length}</span>{" "}
              {/* Display the number of likes */}
            </button>
            <button className="flex items-center gap-1 text-gray-400 cursor-not-allowed">
              <MessageCircle size={20} />
              <span>{post.comments ? post.comments.length : 0}</span>{" "}
              {/* Display number of comments */}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Microblogging;
