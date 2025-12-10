// companyService.ts
import axios from "axios";
import { API_BASE_URL, API_ENDPOINTS } from "../config/api";

const COMPANY_URL = `${API_BASE_URL}${API_ENDPOINTS.COMPANY}`; // ex: http://10.0.2.2/gestion_entreprises/api/entreprises

export interface CompanyData {
  companyName: string;
  address: string;
  phone: string;
  email: string;
  nif: string;
  stat: string;
  rcs: string;
  logoUrl?: string | null;
}

/* -------------------------------------------------
   Helper : construit FormData avec blob logo
-------------------------------------------------- */
const buildFormData = async (data: CompanyData, logoUri?: string | null): Promise<FormData> => {
  const fd = new FormData();
  fd.append("nom", data.companyName.trim());
  fd.append("adresse", data.address.trim());
  fd.append("telephone", data.phone.trim());
  fd.append("email", data.email.trim());
  fd.append("nif", data.nif.trim());
  fd.append("stat", data.stat.trim());
  fd.append("rcs", data.rcs.trim());

  if (logoUri) {
    const fileName = logoUri.split("/").pop() || "logo.jpg";
    const response = await fetch(logoUri);
    const blob = await response.blob();
    fd.append("logo", blob, fileName);
  }

  return fd;
};

/* -------------------------------------------------
   CRUD
-------------------------------------------------- */
export const companyService = {
  /* CREATE + logo optionnel */
  createCompany: async (data: CompanyData, logoUri?: string | null) => {
    const formData = await buildFormData(data, logoUri);
    try {
      const res = await axios.post(COMPANY_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data; // { id, nom, adresse ..., logo:"abc123.jpg", logo_url:"http://..." }
    } catch (e: any) {
      throw e.response?.data?.message || "Erreur création entreprise";
    }
  },

  /* UPDATE (id numérique) + logo optionnel */
  updateCompany: async (id: number, data: Partial<CompanyData>, logoUri?: string | null) => {
    const formData = await buildFormData(
      {
        companyName: data.companyName ?? "",
        address: data.address ?? "",
        phone: data.phone ?? "",
        email: data.email ?? "",
        nif: data.nif ?? "",
        stat: data.stat ?? "",
        rcs: data.rcs ?? "",
      },
      logoUri
    );
    try {
      const res = await axios.post(`${COMPANY_URL}/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    } catch (e: any) {
      throw e.response?.data?.message || "Erreur mise à jour entreprise";
    }
  },

  /* GET ALL */
  getCompanies: async () => {
    const res = await axios.get(COMPANY_URL);
    return res.data.data; // tableau
  },

  /* GET ONE */
  getCompany: async (id: number) => {
    const res = await axios.get(`${COMPANY_URL}/${id}`);
    return res.data.data; // objet
  },

  /* DELETE */
  deleteCompany: async (id: number) => {
    const res = await axios.delete(`${COMPANY_URL}/${id}`);
    return res.data;
  },
};