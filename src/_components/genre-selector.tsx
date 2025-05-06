import React, { useEffect } from "react";
import { useMovieStore } from "../_store/movie-store";
import { Button } from "../_ui/button";
import { SectionTitle } from "../_ui/section-title";
import { LoadingCircle } from "../_ui/loading-circle";

const GenreSelector: React.FC = () => {
  const availableGenres = useMovieStore((state) => state.availableGenres);
  const selectedGenreIds = useMovieStore((state) => state.selectedGenreIds);
  const isFetchingGenres = useMovieStore((state) => state.isFetchingGenres);
  const error = useMovieStore((state) => state.error);
  const fetchAvailableGenres = useMovieStore(
    (state) => state.fetchAvailableGenres
  );
  const setSelectedGenreIds = useMovieStore(
    (state) => state.setSelectedGenreIds
  );

  useEffect(() => {
    fetchAvailableGenres();
  }, [fetchAvailableGenres]);

  return (
    <div className="w-1/3 flex flex-col gap-4 items-center">
      <SectionTitle title="GENRE" />

      {isFetchingGenres && availableGenres.length === 0 && (
        <div className="flex-grow flex items-center justify-center">
          <LoadingCircle />
        </div>
      )}

      {error && availableGenres.length === 0 && (
        <p className="text-red-500 text-sm">Error loading genres: {error}</p>
      )}

      {!isFetchingGenres && availableGenres.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:gap-3 w-full grow">
          {availableGenres.map((genre) => {
            const isSelected = selectedGenreIds.includes(genre.id);
            return (
              <Button
                key={genre.id}
                onClick={() => setSelectedGenreIds(genre.id)}
                variant="card"
                isSelected={isSelected}
                size="small"
                className="w-full"
              >
                {genre.name}
              </Button>
            );
          })}
        </div>
      )}

      {!isFetchingGenres && !error && availableGenres.length === 0 && (
        <p className="text-gray-500 text-sm">No genres found.</p>
      )}
    </div>
  );
};

export default GenreSelector;
