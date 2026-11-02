import api from "./api";

export async function uploadFile(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/files", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}

export async function getFile(id, signal) {
  const response = await api.get(`/files/${id}`, { signal });
  return response.data;
}
