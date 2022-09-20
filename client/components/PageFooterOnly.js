import Footer from "./Footer";

export default function PageFooterOnly(props) {
  return (
    <div>
      <div className="flex flex-col h-screen font-mono text-gray-500">
        <main className="flex-grow bg-gray-600">{props.children}</main>
        <Footer />
      </div>
    </div>
  );
}
