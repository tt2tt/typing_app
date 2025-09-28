import React from "react";
import Link from "next/link";

const Header = () => {
  return (
    <header className="w-full py-4 bg-blue-600 text-white shadow-md">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">タイピングアプリ</h1>
        <nav className="space-x-4">
          <Link href="/signup" className="underline hover:text-gray-200">
            サインアップ
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
