import {publicApiClient} from "@/api/publicApiClient";
import {GET_ALL_MAJORS} from "@/constants/apiAddress";

export type Major = {
    id: number;
    name: string;
};

export async function getAllMajorsPublic(): Promise<Major[]> {
    const res = await publicApiClient.get<Major[]>(GET_ALL_MAJORS);
    return res.data;
}
