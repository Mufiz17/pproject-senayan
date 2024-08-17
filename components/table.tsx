import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, TableHeader, TableBody, TableColumn, TableRow, TableCell } from "@nextui-org/table";
import { Checkbox } from "@nextui-org/checkbox";
import { Button } from "@nextui-org/button";

// Define types for the data
interface RowData {
    id: string;
    name: string;
    status_pembayaran: "Sudah Bayar" | "Belum Bayar";
    status_hadir: string;
}

export default function App() {
    const [data, setData] = useState<RowData[]>([]);

    useEffect(() => {
        // Fetch data from the provided URL
        axios.get('https://3a43281d-df06-46a9-9932-edc4fa36fcbd-00-3acy4zq908kcf.riker.replit.dev/data/peserta')
            .then(response => {
                setData(response.data);
            })
            .catch(error => {
                console.error("There was an error fetching the data!", error);
            });
    }, []);

    const handleCheckboxChange = (id: string, status: "Sudah Bayar" | "Belum Bayar") => {
        setData(prevData =>
            prevData.map(row =>
                row.id === id ? { ...row, status_pembayaran: status } : row
            )
        );
    };

    const handleHadirClick = (id: string) => {
        // POST request to the confirm endpoint
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
        <Table removeWrapper aria-label="Example static collection table" className="shadow">
            <TableHeader>
                <TableColumn>NO</TableColumn> 
                <TableColumn>NAME</TableColumn>
                <TableColumn>Sudah Bayar</TableColumn>
                <TableColumn>Belum Bayar</TableColumn>
                <TableColumn>Actions</TableColumn>
            </TableHeader>
            <TableBody>
                {data.map((row, index) => (
                    <TableRow key={row.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>
                            <Checkbox
                                isSelected={row.status_pembayaran === "Sudah Bayar"}
                                color="success"
                                onChange={() => handleCheckboxChange(row.id, "Sudah Bayar")}
                            >
                                Sudah
                            </Checkbox>
                        </TableCell>
                        <TableCell>
                            <Checkbox
                                isSelected={row.status_pembayaran === "Belum Bayar"}
                                color="danger"
                                onChange={() => handleCheckboxChange(row.id, "Belum Bayar")}
                            >
                                Belum
                            </Checkbox>
                        </TableCell>
                        <TableCell>
                            <Button
                                color="primary"
                                isDisabled={row.status_pembayaran === "Belum Bayar" || row.status_hadir === "Hadir"}
                                onPress={() => handleHadirClick(row.id)}
                            >
                                Hadir
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
