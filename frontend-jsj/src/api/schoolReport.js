// src/api/schoolReport.js
import api from "./client";

export const listSchoolReports = (params) =>
  api.get("/school_report/", { params }).then(r => r.data);

export const getSchoolReport = (id) =>
  api.get(`/school_report/${id}`).then(r => r.data);

export const createSchoolReport = (payload) =>
  api.post("/school_report/", payload).then(r => r.data);

export const updateSchoolReport = (id, payload) =>
  api.put(`/school_report/${id}`, payload).then(r => r.data);

export const deleteSchoolReport = (id) =>
  api.delete(`/school_report/${id}`).then(r => r.data);
