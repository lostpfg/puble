import { useEffect, useState } from "react";
import type { MonitoringData, Nullable } from "../types";
import { PubSub } from "../core";

const useMonitorData = () => {
    const [data, setData] = useState<Nullable<MonitoringData>>(null);

    useEffect(() => {
        const monitor = PubSub.monitorEvents().subscribe(setData);
        return () => monitor?.unsubscribe();
    }, []);

    return data;
}

export default useMonitorData;