export default function Footer() {
  return (
    <footer className="bg-green-700 text-white py-8 mt-16 rounded-t-3xl">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-xl font-bold mb-2">Gram Mitra</h4>
            <p>Empowering Rural India with Smart Solutions</p>
          </div>
          <div className="md:text-right">
            <p>© {new Date().getFullYear()} Gram Mitra. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
