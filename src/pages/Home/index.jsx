import { useEffect, useState } from "react";
export default function Home() {
  const [comment, setComment] = useState([]);
  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/comments")
      .then((response) => response.json())
      .then((response) => {
        setComment(response);
      });
  }, []);
  return (
    <>
      <h1>HOME</h1>
    </>
  );
}
