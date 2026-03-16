import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../../store";

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
  prepareHeaders: (headers, { getState }) => {
    const token = localStorage.getItem("token");

    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery,
  tagTypes: [

    "Selection",
    "ProfessionalFigure",
    "User",
    "Auth",
    "Announcement",
    "Application",
    "Company",
    "JobCollection",
    "AnnouncementApproval",
    "Invoice",

    "BigsterTest",
    "BigsterTestList",
    "BigsterProfile",
    "BigsterStats",
    "BigsterReport",
    "Shortlist",
  ],
  endpoints: (builder) => ({}),
});
