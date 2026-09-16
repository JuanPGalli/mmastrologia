import { Payment } from "../models/Payment";
import { Review } from "../models/Review";
import { Service } from "../models/Service";
import { User } from "../models/User";

type ReviewPayload = {
  serviceId?: unknown;
  rating?: unknown;
  text?: unknown;
};

export const createReview = async (customerId: string, payload: ReviewPayload) => {
  const serviceId = typeof payload.serviceId === "string" ? payload.serviceId : "";
  const rating = Number(payload.rating);
  const text = typeof payload.text === "string" ? payload.text.trim() : "";

  if (!serviceId || !rating || !text) {
    throw new Error("Faltan datos de la reseña.");
  }
  if (rating < 1 || rating > 5) {
    throw new Error("La calificación debe ser de 1 a 5.");
  }
  if (text.length > 1000) {
    throw new Error("El texto es demasiado largo.");
  }

  const hasPurchased = await Payment.exists({
    customerId,
    serviceId,
    status: "approved",
  });
  if (!hasPurchased) {
    throw new Error("Solo podés reseñar consultas que hayas pagado.");
  }

  const alreadyReviewed = await Review.exists({ customerId, serviceId });
  if (alreadyReviewed) {
    throw new Error("Ya dejaste una reseña para esta consulta.");
  }

  const [service, user] = await Promise.all([
    Service.findById(serviceId),
    User.findById(customerId),
  ]);
  if (!service) throw new Error("La consulta no existe.");
  if (!user) throw new Error("Usuario no encontrado.");

  return Review.create({
    customerId,
    name: user.name,
    serviceId,
    serviceTitle: service.title,
    rating,
    text,
  });
};

export const getApprovedReviews = async () => {
  return Review.find({ approved: true }).sort({ createdAt: -1 }).limit(12);
};

export const getAllReviewsAdmin = async () => {
  return Review.find().sort({ createdAt: -1 });
};

export const setReviewApproval = async (id: string, approved: boolean) => {
  const review = await Review.findByIdAndUpdate(id, { approved }, { new: true });
  if (!review) throw new Error("Reseña no encontrada.");
  return review;
};

export const deleteReview = async (id: string) => {
  const review = await Review.findByIdAndDelete(id);
  if (!review) throw new Error("Reseña no encontrada.");
  return review;
};
