import axios from 'axios';
import React, { useEffect, useState } from 'react'
import UAParser from 'ua-parser-js';

export default function useDeviceInfo() {
    const [deviceDetails, setDeviceDetails] = useState({})
    const [ip, setIP] = useState("");
    const getDeviceInfo = async () => {
        const parser = new UAParser();
        const result = await parser.getResult();
        setDeviceDetails(result)
    }

    const getData = async () => {
        const res = await axios.get("https://api.ipify.org/?format=json");
        setIP(res.data.ip);
    };
    useEffect(() => {
        getData();
        getDeviceInfo()
    }, []);
    return { deviceDetails, ip }
}
