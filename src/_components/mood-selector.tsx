import React from "react";
import { useMovieStore } from "../_store/movie-store"; // Import the store
import { Button } from "../_ui/button";
import { SectionTitle } from "../_ui/section-title";

// Define moods statically or fetch if needed
const moods = ["Happy", "Sad", "Excited", "Calm", "Tense", "Romantic"];

const MoodSelector: React.FC = () => {
  // Get state and actions from the store
  const selectedMoods = useMovieStore((state) => state.moods);
  const setMood = useMovieStore((state) => state.setMoods); // Renamed action

  return (
    <div className="w-full flex flex-col gap-2">
      <SectionTitle title="MOOD" />
      <div className="w-full flex gap-2">
        {moods.map((mood) => {
          const isSelected = selectedMoods.includes(mood);
          return (
            <Button
              key={mood}
              onClick={() => setMood(mood)}
              variant="card"
              isSelected={isSelected}
              className="w-full"
            >
              {mood}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default MoodSelector;
