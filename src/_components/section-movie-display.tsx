import React, { useRef } from "react";
import { useMovieStore } from "../_store/movie-store";
import { Movie } from "../_types/movies";
import { LoadingCircle } from "../_ui/loading-circle";
import { SectionTitle } from "../_ui/section-title";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Card } from "../_ui/card";

const SectionMovieDisplay: React.FC = () => {
  const suggestedMovies = useMovieStore((state) => state.suggestedMovies);
  const suggestionExplanation = useMovieStore(
    (state) => state.suggestionExplanation
  );
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
            {suggestionExplanation ||
              'Select mood(s) and genre(s) then click "Get Suggestions", or no movies were found.'}
          </p>
        </div>
      )}

      {!isFetchingSuggestions && !error && suggestedMovies.length > 0 && (
        <div className="w-full flex flex-col gap-2 grow">
          {suggestionExplanation && (
            <div className="group relative w-full bg-blue-50 border border-blue-200 rounded-lg text-blue-700 cursor-pointer">
              {/* Placeholder content - establishes size and fades out */}
              <div className="p-4 transition-opacity duration-150 ease-in-out group-hover:opacity-0">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 flex-shrink-0" />
                  <p className="font-semibold">Why these movies?</p>
                </div>
                <p className="text-sm line-clamp-2">{suggestionExplanation}</p>
              </div>

              {/* Full content - overlays on hover */}
              <div
                className="absolute top-0 left-0 w-full h-auto min-h-full
                           p-4 bg-blue-50 border border-blue-300 rounded-lg shadow-xl 
                           opacity-0 group-hover:opacity-100 
                           transform scale-95 group-hover:scale-100 
                           transition-all duration-300 ease-in-out 
                           pointer-events-none group-hover:pointer-events-auto 
                           z-20 overflow-y-auto max-h-80"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 flex-shrink-0" />
                  <p className="font-semibold">Why these movies?</p>
                </div>
                <p className="text-sm">{suggestionExplanation}</p>
              </div>
            </div>
          )}
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
        </div>
      )}
    </div>
  );
};

export default SectionMovieDisplay;

const MovieCard: React.FC<{ movie: Movie }> = ({ movie }) => {
  const posterBaseUrl = "https://image.tmdb.org/t/p/w500";
  return (
    <Card className="flex flex-col w-64 flex-shrink-0 cursor-pointer">
      {movie.poster_path ? (
        <img
          src={`${posterBaseUrl}${movie.poster_path}`}
          alt={`${movie.title} poster`}
          className="rounded w-full object-cover aspect-[7/8] bg-gray-200"
          loading="lazy"
        />
      ) : (
        <div className="aspect-[3/4] bg-gray-200 rounded flex items-center justify-center text-gray-400 text-sm">
          No Poster
        </div>
      )}
      <div className="flex flex-col gap-2 px-3 py-2">
        <h3 className="text-lg font-semibold truncate" title={movie.title}>
          {movie.title}
        </h3>
        <div className="flex flex-col gap-2">
          <p className="text-sm text-gray-600 line-clamp-3 flex-grow">
            {movie.overview}
          </p>
          <p className="text-sm text-gray-500 mt-auto">
            Rating:{" "}
            {movie.vote_average > 0 ? movie.vote_average.toFixed(1) : "N/A"}
          </p>
        </div>
      </div>
    </Card>
  );
};
