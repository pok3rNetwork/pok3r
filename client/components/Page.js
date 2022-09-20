import Head from "next/head";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function Page(props) {
  return (
    <div>
      <div className="flex flex-col h-screen font-mono text-gray-500">
        <Navbar className="z-50" />
        <main className="flex-grow">{props.children}</main>
        <Footer />
      </div>
    </div>
  );
}
