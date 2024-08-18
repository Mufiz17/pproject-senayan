import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, TableHeader, TableBody, TableColumn, TableRow, TableCell } from "@nextui-org/table";
import { Checkbox } from "@nextui-org/checkbox";
import { Button } from "@nextui-org/button";
import { PDFDownloadLink, Document, Page, Text as PDFText, View, StyleSheet } from "@react-pdf/renderer";
import './Modal.css'; // Import CSS for the modal

// Define types for the data
interface RowData {
    id: string;
    name: string;
    status_pembayaran: "Sudah Bayar" | "Belum Bayar";
    status_hadir: string;
}

// Define styles for the PDF
const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontFamily: "Helvetica",
    },
    header: {
        textAlign: "center",
        marginBottom: 20,
    },
    table: {
        display: "flex",
        flexDirection: "column",
        width: "100%",
        borderStyle: "solid",
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 4,
        marginBottom: 15,
    },
    tableHeader: {
        display: "flex",
        flexDirection: "row",
        fontWeight: "bold",
        backgroundColor: "#f5f5f5",
    },
    tableRow: {
        display: "flex",
        flexDirection: "row",
    },
    tableCell: {
        flex: 1,
        borderStyle: "solid",
        borderWidth: 1,
        borderColor: "#ddd",
        padding: 5,
        textAlign: "center",
    },
    headerText: {
        fontSize: 24,
        fontWeight: "bold",
    },
    footer: {
        marginTop: 20,
        textAlign: "right",
    },
    footerText: {
        fontSize: 12,
        fontWeight: "bold",
    },
});

const MyDocument = ({ data }: { data: RowData[] }) => {
    const hadirCount = data.filter(row => row.status_hadir === "Hadir").length;
    const tidakHadirCount = data.filter(row => row.status_hadir !== "Hadir").length;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <PDFText style={styles.headerText}>Daftar Peserta Kehadiran</PDFText>
                </View>
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <View style={styles.tableCell}><PDFText>No</PDFText></View>
                        <View style={styles.tableCell}><PDFText>Nama</PDFText></View>
                        <View style={styles.tableCell}><PDFText>Kehadiran</PDFText></View>
                    </View>
                    {data.map((row, index) => (
                        <View key={row.id} style={styles.tableRow}>
                            <View style={styles.tableCell}><PDFText>{index + 1}</PDFText></View>
                            <View style={styles.tableCell}><PDFText>{row.name}</PDFText></View>
                            <View style={styles.tableCell}>
                                <PDFText>{row.status_hadir === "Hadir" ? "✔ Hadir" : "❌ Tidak Hadir"}</PDFText>
                            </View>
                        </View>
                    ))}
                </View>
                <View style={styles.footer}>
                    <PDFText style={styles.footerText}>Hadir: {hadirCount} orang</PDFText>
                    <PDFText style={styles.footerText}>Tidak Hadir: {tidakHadirCount} orang</PDFText>
                </View>
            </Page>
        </Document>
    );
};

export default function App() {
    const [data, setData] = useState<RowData[]>([]);
    const [filteredData, setFilteredData] = useState<RowData[]>([]);
    const [paymentFilter, setPaymentFilter] = useState<string | null>(null);
    const [attendanceFilter, setAttendanceFilter] = useState<string | null>(null);
    const [showPreview, setShowPreview] = useState(false);

    useEffect(() => {
        axios.get('https://3a43281d-df06-46a9-9932-edc4fa36fcbd-00-3acy4zq908kcf.riker.replit.dev/data/peserta')
            .then(response => {
                setData(response.data);
                setFilteredData(response.data);
            })
            .catch(error => {
                console.error("There was an error fetching the data!", error);
            });
    }, []);

    useEffect(() => {
        let filtered = data;
    
        if (paymentFilter) {
            filtered = filtered.filter(row => row.status_pembayaran === paymentFilter);
        }
    
        if (attendanceFilter) {
            filtered = filtered.filter(row => row.status_hadir === attendanceFilter);
        }
    
        setFilteredData(filtered);
    }, [paymentFilter, attendanceFilter, data]);

    const handleCheckboxChange = (id: string, status: "Sudah Bayar" | "Belum Bayar") => {
        setData(prevData =>
            prevData.map(row =>
                row.id === id ? { ...row, status_pembayaran: status } : row
            )
        );
    };

    const handleHadirClick = (id: string) => {
        axios.post('https://3a43281d-df06-46a9-9932-edc4fa36fcbd-00-3acy4zq908kcf.riker.replit.dev/confirm/peserta', { id })
            .then(response => {
                console.log('Hadir confirmed:', response.data);
                setData(prevData =>
                    prevData.map(row =>
                        row.id === id ? { ...row, status_hadir: "Hadir" } : row
                    )
                );
            })
            .catch(error => {
                console.error("There was an error confirming the hadir status!", error);
            });
    };

    return (
        <>
            <div className="mb-4 flex justify-end">
                <div className="ml-auto flex">
                    <Button
                        color="primary"
                        className="mr-2"
                        onClick={() => setShowPreview(true)}
                    >
                        Rekap
                    </Button>
                    <Button color="success">Tambah</Button>
                </div>
            </div>
            <div className="mb-4 flex space-x-4">
                <Checkbox
                    defaultSelected={paymentFilter === "Sudah Bayar"}
                    onChange={() => setPaymentFilter(paymentFilter === "Sudah Bayar" ? null : "Sudah Bayar")}
                >
                    Sudah Bayar
                </Checkbox>
                <Checkbox
                    defaultSelected={paymentFilter === "Belum Bayar"}
                    onChange={() => setPaymentFilter(paymentFilter === "Belum Bayar" ? null : "Belum Bayar")}
                >
                    Belum Bayar
                </Checkbox>
                <Checkbox
                    defaultSelected={attendanceFilter === "Hadir"}
                    onChange={() => setAttendanceFilter(attendanceFilter === "Hadir" ? null : "Hadir")}
                >
                    Hadir
                </Checkbox>
                <Checkbox
                    isSelected={attendanceFilter === "Tidak Hadir"}
                    onChange={() => setAttendanceFilter(attendanceFilter === "Tidak Hadir" ? null : "Tidak Hadir")}
                >
                    Tidak Hadir
                </Checkbox>
            </div>
            <Table removeWrapper aria-label="Example static collection table" className="shadow">
                <TableHeader>
                    <TableColumn>NO</TableColumn>
                    <TableColumn>NAME</TableColumn>
                    <TableColumn>Sudah Bayar</TableColumn>
                    <TableColumn>Belum Bayar</TableColumn>
                    <TableColumn>Action</TableColumn>
                </TableHeader>
                <TableBody>
                    {filteredData.map((row, index) => (
                        <TableRow key={row.id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{row.name}</TableCell>
                            <TableCell>
                                <Checkbox
                                    isSelected={row.status_pembayaran === "Sudah Bayar"}
                                    onChange={() => handleCheckboxChange(row.id, "Sudah Bayar")}
                                >
                                    Sudah Bayar
                                </Checkbox>
                            </TableCell>
                            <TableCell>
                                <Checkbox
                                    color="danger"
                                    isSelected={row.status_pembayaran === "Belum Bayar"}
                                    onChange={() => handleCheckboxChange(row.id, "Belum Bayar")}
                                >
                                    Belum Bayar
                                </Checkbox>
                            </TableCell>
                            <TableCell>
                                <Button
                                    color="primary"
                                    isDisabled={row.status_pembayaran === "Belum Bayar" || row.status_hadir === "Hadir"}
                                    onClick={() => handleHadirClick(row.id)}
                                >
                                    Hadir
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            {showPreview && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Preview PDF</h5>
                            <button className="close-button" onClick={() => setShowPreview(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <PDFDownloadLink
                                document={<MyDocument data={filteredData} />}
                                fileName="rekap-kehadiran.pdf"
                            >
                                {({ loading }) => (loading ? "Loading document..." : "Download PDF")}
                            </PDFDownloadLink>
                            <iframe
                                src={`data:application/pdf;base64,${window.btoa(
                                    documentToBase64(<MyDocument data={filteredData} />)
                                )}`}
                                style={{ width: '100%', height: '500px' }}
                            ></iframe>
                        </div>
                        <div className="modal-footer">
                            <Button onClick={() => setShowPreview(false)}>Close</Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

// Utility function to convert React PDF document to base64
const documentToBase64 = (doc: React.ReactElement) => {
    // This function needs to be implemented to convert the PDF document to base64
    // For example, you can use the @react-pdf/renderer's toBlob method
    // or a library like pdfkit to generate a base64 encoded string.
    return "";
};
