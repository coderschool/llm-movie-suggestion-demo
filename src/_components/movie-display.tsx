import React, { useRef } from "react";
import { useMovieStore } from "../_store/movie-store";
import { Movie } from "../_types/movies";
import { LoadingCircle } from "../_ui/loading-circle";
import { SectionTitle } from "../_ui/section-title";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "../_ui/card";

const MovieDisplay: React.FC = () => {
  const suggestedMovies = useMovieStore((state) => state.suggestedMovies);
  const isFetchingSuggestions = useMovieStore(
    (state) => state.isFetchingSuggestions
  );
  const error = useMovieStore((state) => state.error);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollAmount = 300;

  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="w-2/3 flex flex-col gap-2 items-center">
      <SectionTitle title="SUGGESTIONS" />

      {isFetchingSuggestions && (
        <div className="grow flex items-center justify-center">
          <LoadingCircle />
        </div>
      )}

      {!isFetchingSuggestions && error && (
        <div className="flex-grow flex items-center justify-center p-4 bg-red-100 border border-red-300 rounded-lg">
          <p className="text-red-700 text-center">
            <span className="font-semibold">Error:</span> {error}
          </p>
        </div>
      )}

      {!isFetchingSuggestions && !error && suggestedMovies.length === 0 && (
        <div className="flex-grow flex items-center justify-center">
          <p className="text-gray-500 italic text-center">
            Select mood(s) and genre(s) then click "Get Suggestions", or no
            movies were found.
          </p>
        </div>
      )}

      {!isFetchingSuggestions && !error && suggestedMovies.length > 0 && (
        <div className="flex items-center w-full gap-2 grow relative">
          <button
            onClick={handleScrollLeft}
            className="hover:bg-gray-100 hover:cursor-pointer rounded-full w-10 h-10 flex-shrink-0 bg-white flex items-center justify-center shadow-md absolute left-2 z-10"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div
            ref={scrollContainerRef}
            className="flex flex-row gap-4 flex-grow overflow-x-auto p-1 scroll-smooth no-scrollbar"
          >
            {suggestedMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie as Movie} />
            ))}
          </div>

          <button
            onClick={handleScrollRight}
            className="hover:bg-gray-100 hover:cursor-pointer rounded-full w-10 h-10 flex-shrink-0 bg-white flex items-center justify-center shadow-md absolute right-2 z-10"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default MovieDisplay;

const MovieCard: React.FC<{ movie: Movie }> = ({ movie }) => {
  const posterBaseUrl = "https://image.tmdb.org/t/p/w500";
  return (
    <Card className="flex flex-col w-68 flex-shrink-0 cursor-pointer">
      {movie.poster_path ? (
        <img
          src={`${posterBaseUrl}${movie.poster_path}`}
          alt={`${movie.title} poster`}
          className="rounded mb-2 w-full object-cover aspect-[3/4] bg-gray-200"
          loading="lazy"
        />
      ) : (
        <div className="aspect-[3/4] bg-gray-200 rounded mb-2 flex items-center justify-center text-gray-400 text-sm">
          No Poster
        </div>
      )}
      <div className="flex flex-col gap-2 p-3">
        <h3 className="text-lg font-semibold mb-1 truncate" title={movie.title}>
          {movie.title}
        </h3>
        <p className="text-sm text-gray-600 mb-2 line-clamp-3 flex-grow">
          {movie.overview}
        </p>
        <p className="text-sm text-gray-500 mt-auto pt-1">
          Rating:{" "}
          {movie.vote_average > 0 ? movie.vote_average.toFixed(1) : "N/A"}
        </p>
      </div>
    </Card>
  );
};
