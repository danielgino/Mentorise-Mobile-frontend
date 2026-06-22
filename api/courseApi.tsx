import {apiClient} from "@/api/apiClient";
import {ApiCourse} from "@/types/course";
import {GET_MY_COURSES} from "@/constants/apiAddress";



export async function getMyCourses(): Promise<ApiCourse[]> {
    const res = await apiClient.get<ApiCourse[]>(GET_MY_COURSES);
    return res.data;
}