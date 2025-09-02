import Header from "./components/Header";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      <Header />
      <main className="flex flex-col items-center justify-center flex-1 w-full px-4 py-8">
        <h2 className="text-xl font-semibold mb-4 text-black">ようこそ！タイピングアプリへ</h2>
        <p className="mb-8 text-gray-700">このアプリではタイピング練習ができます。下の「スタート」ボタンを押して始めましょう。</p>
      </main>
      <Footer />
    </div>
  );
}
