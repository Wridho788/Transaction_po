import React, { useState,useEffect } from "react";
import Modal from "react-modal";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import CurrencyInput from "react-currency-input-field";

import formatRupiah from "./utils";
import salesData from "../Datas";
import "./style.css";

const pageSize = 5;

const SalesTable = () => {
      // State untuk menyimpan data penjualan
  const [salesData, setSalesData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [filters, setFilters] = useState({
    noFaktur: "",
    tanggalFaktur: "",
    namaCustomer: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [showModalEdit, setShowModalEdit] = useState(false);
  const [formData, setFormData] = useState({
    id: 0,
    noFaktur: "",
    tanggalFaktur: "",
    namaCustomer: "",
    totalAmount: 0,
    items: [], // Ganti state untuk item dengan satu state
  });

  // Menyimpan item barang
  const [itemName, setItemName] = useState("");
  const [itemQty, setItemQty] = useState(0);
  const [itemPrice, setItemPrice] = useState(0);
  const [itemTotalPrice, setItemTotalPrice] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  // State untuk menyimpan data yang akan diedit
  const [editFormData, setEditFormData] = useState({
    id: "",
    noFaktur: "",
    tanggalFaktur: "",
    namaCustomer: "",
    items: [],
  });
  // Handler untuk menambah item barang
  const handleAddItem = () => {
    if (itemName && itemQty && itemPrice) {
      const newItem = {
        name: itemName,
        qty: itemQty,
        price: itemPrice,
        totalPrice: itemQty * itemPrice,
      };

      // Tambahkan item baru ke dalam formData
      setFormData((prevData) => ({
        ...prevData,
        items: [...prevData.items, newItem],
      }));

      // Hitung ulang Grand Total berdasarkan item-item yang ada dalam formData
      const totalHarga = formData.items.reduce(
        (total, item) => total + item.totalPrice,
        newItem.totalPrice
      );

      // Set Grand Total yang baru dihitung ke dalam state
      setTotalAmount(totalHarga);

      // Reset nilai input setelah ditambahkan
      setItemName("");
      setItemQty(0);
      setItemPrice(0);
      setItemTotalPrice(0);
    } else {
      alert("Mohon lengkapi semua field");
    }
  };

  const handlePriceChange = (value) => {
    // Menghapus karakter non-digit dari nilai input
    const price = value.replace(/[^0-9]/g, "");
    setItemPrice(price);
  };

  // Fungsi untuk menampilkan modal
  const openModal = () => {
    setShowModal(true);
  };

  // Fungsi untuk membuka modal edit
  const openEditModal = (id) => {
    // Temukan data yang akan diedit berdasarkan ID
    const dataToEdit = salesData.find((item) => item.id === id);
    // Set data yang akan diedit ke dalam state editFormData
    setEditFormData(dataToEdit);
    // Buka modal
    setShowModalEdit(true);
  };

  // Fungsi untuk menutup modal
  const closeModal = () => {
    setShowModal(false);
    setShowModalEdit(false);
  };

  // Fungsi untuk mengatur nilai formulir
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Fungsi untuk mengubah nilai formulir saat mengedit data
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Mengubah halaman
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Mengatur kolom untuk sorting
  const handleSort = (column) => {
    if (sortColumn === column) {
      // Jika kolom yang diklik sama dengan yang sedang di-sort, ubah arah sort
      setSortDirection((prevDirection) =>
        prevDirection === "asc" ? "desc" : "asc"
      );
    } else {
      // Jika kolom yang diklik berbeda dengan yang sedang di-sort, ubah kolom dan arah sort
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Mengatur filter
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const renderData = () => {
    const storedData =
      JSON.parse(localStorage.getItem("salesData")) || salesData;

    let filteredData = storedData.filter(
      (item) =>
        item.noFaktur.toLowerCase().includes(filters.noFaktur.toLowerCase()) &&
        item.tanggalFaktur
          .toLowerCase()
          .includes(filters.tanggalFaktur.toLowerCase()) &&
        item.namaCustomer
          .toLowerCase()
          .includes(filters.namaCustomer.toLowerCase())
    );

    // Sorting
    if (sortColumn) {
      filteredData = filteredData.sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];

        if (aValue < bValue) {
          return sortDirection === "asc" ? -1 : 1;
        } else if (aValue > bValue) {
          return sortDirection === "asc" ? 1 : -1;
        } else {
          return 0;
        }
      });
    }

    // Pagination
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredData.slice(startIndex, endIndex);
  };

  const handleEdit = (id) => {
    // Ambil data dari localStorage
    const storedData = JSON.parse(localStorage.getItem("salesData")) || [];
    // Temukan data yang akan diedit berdasarkan ID
    const dataToEdit = storedData.find((item) => item.id === id);
    // Set data yang akan diedit ke dalam state editFormData
    setEditFormData(dataToEdit);
    // Buka modal
    setShowModalEdit(true);
  };

 // Handler untuk menghapus data penjualan berdasarkan ID
 const handleDelete = (id) => {
    console.log(`Data dengan ID ${id} berhasil dihapus`);

    // Saring data untuk menghilangkan data dengan ID yang sesuai
    const updatedData = salesData.filter((item) => item.id !== id);

    // Simpan kembali data yang telah disaring ke dalam localStorage
    localStorage.setItem("salesData", JSON.stringify(updatedData));

    // Perbarui state untuk memperbarui tampilan
    setSalesData(updatedData);
  };

  const totalHarga = formData.items.reduce(
    (total, item) => total + item.qty * item.price,
    0
  );

  // Fungsi untuk menambahkan data penjualan
  const handleCreateSale = () => {
    // Hitung grand total
    const grandTotal = formData.items.reduce(
      (total, item) => total + item.qty * item.price,
      0
    );
    // Menghasilkan ID baru dengan konsep auto-increment
    const newId =
      salesData.length > 0 ? salesData[salesData.length - 1].id + 1 : 1;

    // Buat objek data penjualan
    const newSaleData = {
      id: newId,    
      noFaktur: formData.noFaktur,
      tanggalFaktur: formData.tanggalFaktur,
      namaCustomer: formData.namaCustomer,
      items: formData.items,
      grandTotal: grandTotal,
    };

    // Simpan data penjualan ke dalam localStorage
    const salesDataFromLocalStorage =
      JSON.parse(localStorage.getItem("salesData")) || [];
    localStorage.setItem(
      "salesData",
      JSON.stringify([...salesDataFromLocalStorage, newSaleData])
    );

    // Reset formulir dan tutup modal
    setFormData({
      noFaktur: "",
      tanggalFaktur: "",
      namaCustomer: "",
      items: [],
    });
    closeModal();
  };

  // Fungsi untuk menyimpan perubahan saat mengedit data
  const handleEditData = () => {
    const dataIndex = salesData.findIndex(
      (item) => item.id === editFormData.id
    );
    // Pastikan dataIndex tidak bernilai -1, yang menandakan data tidak ditemukan
    if (dataIndex !== -1) {
      // Buat salinan array salesData agar tidak mengubah state secara langsung
      const updatedSalesData = [...salesData];
      // Update data yang sesuai dengan editFormData
      updatedSalesData[dataIndex] = editFormData;

      // Simpan data yang telah diubah ke localStorage
      localStorage.setItem("salesData", JSON.stringify(updatedSalesData));

      // Setelah mengedit data, Anda mungkin ingin menutup modal dan melakukan hal lainnya
      console.log("Data penjualan berhasil diubah:", editFormData);
      closeModal();
    } else {
      console.error(
        "Data penjualan tidak ditemukan untuk diubah:",
        editFormData.id
      );
      // Mungkin tampilkan pesan kesalahan kepada pengguna jika data tidak ditemukan
    }
  };
  // Mengambil data dari localStorage saat komponen dimuat
  useEffect(() => {
    const dataFromLocalStorage = JSON.parse(localStorage.getItem("salesData")) || [];
    setSalesData(dataFromLocalStorage);
  }, []);

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th onClick={() => handleSort("id")}>
              ID
              {sortColumn === "id" &&
                (sortDirection === "asc" ? <FaSortUp /> : <FaSortDown />)}
            </th>
            <th onClick={() => handleSort("noFaktur")}>
              No Faktur{" "}
              {sortColumn === "noFaktur" &&
                (sortDirection === "asc" ? <FaSortUp /> : <FaSortDown />)}
            </th>
            <th onClick={() => handleSort("tanggalFaktur")}>
              Tanggal Faktur{" "}
              {sortColumn === "tanggalFaktur" &&
                (sortDirection === "asc" ? <FaSortUp /> : <FaSortDown />)}
            </th>
            <th onClick={() => handleSort("namaCustomer")}>
              Nama Customer{" "}
              {sortColumn === "namaCustomer" &&
                (sortDirection === "asc" ? <FaSortUp /> : <FaSortDown />)}
            </th>
            <th onClick={() => handleSort("grandTotal")}>
              Grand Total{" "}
              {sortColumn === "grandTotal" &&
                (sortDirection === "asc" ? <FaSortUp /> : <FaSortDown />)}
            </th>
            <th>Aksi</th>
          </tr>
          <tr>
            <th></th>
            <th>
              <input
                type="text"
                name="noFaktur"
                value={filters.noFaktur}
                onChange={handleFilterChange}
                placeholder="Filter No Faktur"
              />
            </th>
            <th>
              <input
                type="text"
                name="tanggalFaktur"
                value={filters.tanggalFaktur}
                onChange={handleFilterChange}
                placeholder="Filter Tanggal Faktur"
              />
            </th>
            <th>
              <input
                type="text"
                name="namaCustomer"
                value={filters.namaCustomer}
                onChange={handleFilterChange}
                placeholder="Filter Nama Customer"
              />
            </th>
            <th></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {renderData().map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.noFaktur}</td>
              <td>{item.tanggalFaktur}</td>
              <td>{item.namaCustomer}</td>
              <td>{formatRupiah(item.grandTotal)}</td>
              <td>
                <button onClick={() => handleEdit(item.id)}>Edit</button>
                <button onClick={() => handleDelete(item.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        {/* Pagination */}
        {[...Array(Math.ceil(salesData.length / pageSize))].map((_, index) => (
          <button key={index} onClick={() => handlePageChange(index + 1)}>
            {index + 1}
          </button>
        ))}
      </div>
      {/* Tombol untuk membuat data penjualan */}
      <button onClick={openModal}>Tambah Data Penjualan</button>
      {/* Modal */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onRequestClose={closeModal}
          contentLabel="Formulir Data Penjualan"
          ariaHideApp={false}
        >
          <h2>Formulir Data Penjualan</h2>
          <form>
            <label>
              No Faktur:
              <input
                type="text"
                name="noFaktur"
                value={formData.noFaktur}
                onChange={handleFormChange}
                maxLength={10}
              />
            </label>
            <label>
              Tanggal Faktur:
              <input
                type="date"
                name="tanggalFaktur"
                value={formData.tanggalFaktur}
                onChange={handleFormChange}
                maxLength={30}
              />
            </label>
            <label>
              Nama Customer:
              <input
                type="text"
                name="namaCustomer"
                value={formData.namaCustomer}
                onChange={handleFormChange}
                maxLength={30}
              />
            </label>
            <label>
              Nama Barang:
              <input
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
            </label>
            <label>
              Qty:
              <input
                type="number"
                value={itemQty}
                onChange={(e) => setItemQty(e.target.value)}
              />
            </label>
            <label>
              Harga (Rp):
              <CurrencyInput
                name="itemPrice"
                value={itemPrice}
                onValueChange={(value) => handlePriceChange(value)}
                allowDecimals={false}
                prefix="Rp "
                groupSeparator="."
                decimalSeparator=","
              />
            </label>
            <button type="button" onClick={handleAddItem}>
              Tambah Item
            </button>
            <table>
              <thead>
                <tr>
                  <th>Nama Barang</th>
                  <th>Qty</th>
                  <th>Harga (Rp)</th>
                  <th>Total (Rp)</th>
                </tr>
              </thead>
              <tbody>
                {formData.items.map((item, index) => (
                  <tr key={index}>
                    <td>{item.name}</td>
                    <td>{item.qty}</td>
                    <td>{formatRupiah(item.price)}</td>
                    <td>{formatRupiah(item.qty * item.price)}</td>
                  </tr>
                ))}
                <tr>
                  <td colSpan="3" style={{ textAlign: "right" }}>
                    Grand Total:
                  </td>
                  <td>{formatRupiah(totalHarga)}</td>
                </tr>
              </tbody>
            </table>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "20px",
              }}
            >
              <button type="button" onClick={closeModal}>
                Batal
              </button>
              <button type="button" onClick={handleCreateSale}>
                Tambah Data
              </button>
            </div>
          </form>
        </Modal>
      )}
      {showModalEdit && (
        <Modal
          isOpen={showModalEdit}
          onRequestClose={closeModal}
          contentLabel="Edit Data Penjualan"
          ariaHideApp={false}
        >
          <h2>Edit Data Penjualan</h2>
          <form>
            <label>
              No Faktur:
              <input
                type="text"
                name="noFaktur"
                value={editFormData.noFaktur}
                onChange={handleFormChange}
                maxLength={10}
              />
            </label>
            <label>
              Tanggal Faktur:
              <input
                type="date"
                name="tanggalFaktur"
                value={editFormData.tanggalFaktur}
                onChange={handleFormChange}
                maxLength={30}
              />
            </label>
            <label>
              Nama Customer:
              <input
                type="text"
                name="namaCustomer"
                value={editFormData.namaCustomer}
                onChange={handleFormChange}
                maxLength={30}
              />
            </label>
            <label>
              Nama Barang:
              <input
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
            </label>
            <label>
              Qty:
              <input
                type="number"
                value={itemQty}
                onChange={(e) => setItemQty(e.target.value)}
              />
            </label>
            <label>
              Harga (Rp):
              <CurrencyInput
                name="itemPrice"
                value={itemPrice}
                onValueChange={(value) => handlePriceChange(value)}
                allowDecimals={false}
                prefix="Rp "
                groupSeparator="."
                decimalSeparator=","
              />
            </label>
            <button type="button" onClick={handleAddItem}>
              Tambah Item
            </button>
            <table>
              <thead>
                <tr>
                  <th>Nama Barang</th>
                  <th>Qty</th>
                  <th>Harga (Rp)</th>
                  <th>Total (Rp)</th>
                </tr>
              </thead>
              <tbody>
                {formData.items.map((item, index) => (
                  <tr key={index}>
                    <td>{item.name}</td>
                    <td>{item.qty}</td>
                    <td>{formatRupiah(item.price)}</td>
                    <td>{formatRupiah(item.qty * item.price)}</td>
                  </tr>
                ))}
                <tr>
                  <td colSpan="3" style={{ textAlign: "right" }}>
                    Grand Total:
                  </td>
                  <td>{formatRupiah(totalHarga)}</td>
                </tr>
              </tbody>
            </table>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "20px",
              }}
            >
              <button type="button" onClick={handleEditData}>
                Simpan Perubahan
              </button>
              <button type="button" onClick={closeModal}>
                Batal
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default SalesTable;
