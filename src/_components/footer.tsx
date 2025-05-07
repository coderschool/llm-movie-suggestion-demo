import { useState } from "react";
import { useMovieStore } from "../_store/movie-store";
import { Button } from "../_ui/button";

const Footer: React.FC = () => {
  const fetchSuggestions = useMovieStore((state) => state.fetchSuggestions);

  const [apiKey, setApiKey] = useState("");

  const handleGetSuggestions = () => {
    if (!apiKey.trim()) {
      alert("Please enter your Gemini API Key.");
      return;
    }
    fetchSuggestions(apiKey);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleGetSuggestions();
    }
  };

  return (
    <div className="border-t-2 border-gray-300 w-full flex justify-between items-center pt-2">
      <div className="flex items-center gap-2">
        <label htmlFor="apiKey">Gemini API Key</label>
        <input
          type="text"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          onKeyDown={handleKeyDown}
          className="border border-gray-300 rounded-md p-2"
        />
      </div>
      <Button size="large" onClick={handleGetSuggestions}>
        Get Suggestions
      </Button>
    </div>
  );
};

export default Footer;
