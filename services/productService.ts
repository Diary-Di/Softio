import axios from "axios";
import * as FileSystem from "expo-file-system";
import { API_BASE_URL, API_ENDPOINTS } from "../config/api";

const PRODUCT_URL = `${API_BASE_URL}${API_ENDPOINTS.PRODUCT}`;

export type CreateProductPayload = {
  ref_produit: string;
  designation: string;
  categorie: string;
  prix_actuel: number;
  qte_disponible: number;
  illustration?: string | null;
  date_mise_a_jour_prix: string;
};

export const productService = {

  /* ------------------------------------
   *  CREATE PRODUCT (avec upload image)
   * ------------------------------------ */
  async createProduct(data: CreateProductPayload) {
    try {
      console.log("📤 Envoi du produit à :", `${PRODUCT_URL}/create`);

      const formData = new FormData();

      for (const key in data) {
        if (key !== "illustration") {
          formData.append(key, String((data as any)[key]));
        }
      }

      // Ajout image
      if (data.illustration) {
        const ext = data.illustration.split(".").pop();
        const mimeType = `image/${ext}`;
        const fileInfo = await FileSystem.getInfoAsync(data.illustration);

        if (fileInfo.exists) {
          formData.append("illustration", {
            uri: data.illustration,
            name: `image_${Date.now()}.${ext}`,
            type: mimeType,
          } as any);
        }
      }

      const response = await axios.post(
        `${PRODUCT_URL}/create`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      return response.data;

    } catch (error: any) {
      console.log("⚠️ Erreur création produit:", error.response?.data || error);
      throw error;
    }
  },

  /* ------------------------------------
   * GET ALL PRODUCTS
   * ------------------------------------ */
  async getAllProducts() {
    try {
      const response = await axios.get(`${PRODUCT_URL}/list`);
      return response.data;
    } catch (error: any) {
      console.log("⚠️ Erreur getAllProducts:", error.response?.data || error);
      throw error;
    }
  },

  /* ------------------------------------
 * GET PRODUCT BY REF_PRODUIT
 * ------------------------------------ */
async getProductByRef(ref_produit: string) {
  try {
    const response = await axios.get(`${PRODUCT_URL}/show/${ref_produit}`);
    return response.data;
  } catch (error: any) {
    console.log("⚠️ Erreur getProductByRef:", error.response?.data || error);
    throw error;
  }
},

/* ------------------------------------
 * UPDATE PRODUCT (avec ref_produit)
 * ------------------------------------ */
async updateProduct(ref_produit: string, data: Partial<CreateProductPayload>) {
  try {
    const formData = new FormData();

    for (const key in data) {
      if (key !== "illustration") {
        formData.append(key, String((data as any)[key]));
      }
    }

    if (data.illustration) {
      const ext = data.illustration.split(".").pop();
      const mimeType = `image/${ext}`;
      const fileInfo = await FileSystem.getInfoAsync(data.illustration);
      if (fileInfo.exists) {
        formData.append("illustration", {
          uri: data.illustration,
          name: `image_${Date.now()}.${ext}`,
          type: mimeType,
        } as any);
      }
    }

    const response = await axios.post(
      `${PRODUCT_URL}/update/${ref_produit}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    return response.data;

  } catch (error: any) {
    console.log("⚠️ Erreur updateProduct:", error.response?.data || error);
    throw error;
  }
},

/* ------------------------------------
 * DELETE PRODUCT (avec ref_produit)
 * ------------------------------------ */
async deleteProduct(ref_produit: string) {
  try {
    const response = await axios.delete(`${PRODUCT_URL}/delete/${ref_produit}`);
    return response.data;
  } catch (error: any) {
    console.log("⚠️ Erreur deleteProduct:", error.response?.data || error);
    throw error;
  }
}
};

export default productService;
