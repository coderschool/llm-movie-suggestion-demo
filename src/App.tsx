import MoodSelector from "./_components/mood-selector";
import GenreSelector from "./_components/genre-selector";
import MovieDisplay from "./_components/movie-display";
import { useMovieStore } from "./_store/movie-store";
import { Button } from "./_ui/button";

function App() {
  const fetchSuggestions = useMovieStore((state) => state.fetchSuggestions);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col p-4 sm:p-6">
      <main className="w-full grow max-w-screen-2xl mx-auto flex flex-col gap-4">
        <MoodSelector />

        <div className="grow flex w-full gap-4 h-full">
          <GenreSelector />
          <MovieDisplay />
        </div>

        <div className="w-full pt-4 border-t border-gray-300 flex justify-end space-x-4">
          <Button onClick={fetchSuggestions} size="large">
            Get Suggestions
          </Button>
        </div>
      </main>
    </div>
  );
}

export default App;
