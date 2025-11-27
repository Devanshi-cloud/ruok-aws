import axios from 'axios';
import { BASE_URL } from "@/utils/constants.ts";
import { addUser } from "@/utils/slice/userSlice.ts";
import { useDispatch } from "react-redux";

const useFetchUser = () => {
  const dispatch = useDispatch();

  const fetchUser = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/profile/get`,
        { withCredentials: true }
      );
      dispatch(addUser(response.data.data));
      return { success: true, user: response.data.data };
    } catch (err) {
      // Handle 401 (unauthorized) gracefully - user is not logged in
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        console.log("User not authenticated");
        return { success: false, error: 'Not authenticated' };
      }
      
      // Log other errors but don't throw
      console.error("Error fetching user:", err);
      return { success: false, error: 'Failed to fetch user' };
    }
  };

  return fetchUser;
};

export default useFetchUser;