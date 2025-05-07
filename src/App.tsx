import SectionMoodSelector from "./_components/section-mood-selector";
import SectionGenreSelector from "./_components/section-genre-selector";
import SectionMovieDisplay from "./_components/section-movie-display";
import Footer from "./_components/footer";

function App() {
  return (
    <div className="h-screen bg-gray-50 text-gray-800 flex flex-col p-4 sm:p-6">
      <main className="w-full grow max-w-screen-2xl mx-auto flex flex-col gap-4">
        <SectionMoodSelector />

        <div className="grow flex w-full gap-4 h-full">
          <SectionGenreSelector />
          <SectionMovieDisplay />
        </div>

        <Footer />
      </main>
    </div>
  );
}

export default App;
