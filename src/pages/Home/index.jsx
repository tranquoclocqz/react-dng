import { useEffect,useState } from "react";
import axios from "axios";
export default function Index() {
  const [result, setResult] = useState([]);
  useEffect(() => {
    const fetch = async () => {
      const response = await axios.get("https://jsonplaceholder.typicode.com/posts");
      setResult(response.data);
    }
    fetch();
  },[]);
  return (
    <div>
      {
        !result && <div>Loading...</div>
      }
      <ul>
        {result.map(e => {
          return <li key={e.id}>
            {e.id} - {e.title} <br />
            {e.body}
          </li>
        })}
      </ul>
    </div>
  );
}
