import Link from "next/link";

export default function SuccessPage() {
  return (
    <main className="h-[70vh] flex flex-col items-center justify-center text-center px-4">

      <h1 className="text-3xl font-semibold mb-4">
        🎉 Pesanan Berhasil!
      </h1>

      <p className="text-gray-500 mb-6">
        Terima kasih telah berbelanja di GadgetHub Store.
      </p>

      <Link
        href="/products"
        className="bg-blue-600 text-white px-6 py-3 rounded-xl"
      >
        Lanjut Belanja
      </Link>

    </main>
  );
}
