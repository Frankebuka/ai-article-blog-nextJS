import AddArticles from "./pages/AddArticles";
import Articles from "./pages/Articles";
import GenerateArticles from "./pages/GenerateArticles";

export default function Home() {
  return (
    <main className="container">
      <div className="row" style={{ marginTop: 70 }}>
        <div className="col-md-8">
          <Articles />
        </div>
        <div className="col-md-4">
          <GenerateArticles />
          <AddArticles />
        </div>
      </div>
    </main>
  );
}
