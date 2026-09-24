import api from "@/lib/axios";

export const loginUser = async (
  username: string,
  password: string
) => {
  const response = await api.post("/auth/login", {
    username: username,
    password: password,
  });

  return response.data;
};