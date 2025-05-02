import api from "./api";
import { User } from "../types/user";

export const userApi = {
  getUsers: async (): Promise<User[]> => {
    const response = await api.get("/users");
    return response.data;
  },
};
