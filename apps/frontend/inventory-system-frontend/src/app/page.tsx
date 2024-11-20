export default function Home() {
  return (
    <>
      <div className="">
        <h1 className="text-4xl font-bold text-center mt-10">Welcome to Inventory System</h1>
        <p className="text-lg text-center mt-4">Please choose a category</p>
        <ul className="flex flex-col items-center mt-4 space-y-2">
          <li>
            <a href="/components" className="text-blue-500 hover:underline">
              Components Showcase
            </a>
          </li>
          <li>
            <a href="/node-demo" className="text-blue-500 hover:underline">
              Node Demo
            </a>
          </li>
        </ul>
      </div>
    </>
  )
}
