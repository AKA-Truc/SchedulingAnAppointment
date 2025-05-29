export interface AppointmentWithDetails {
  appointmentId: number;
  doctorId: number;
  userId: number;
  serviceId: number;
  scheduledTime: Date | string;
  note?: string | null;
  status: string;

  doctor: {
    doctorId: number;
    userId: number;
    specialtyId: number;
    hospitalId: number;
    rating?: number | null;
    bio?: string | null;
    yearsOfExperience: string | null;
    education?: string | null;
    clinic?: string | null;

    specialty?: {
      specialtyId: number;
      name: string;
      description?: string | null;
    };
    user: {
      userId: number;
      fullName: string;
      email: string;
      phone: string;
      role: string;
      gender: string;
      avatar?: string | null;
    };
  };

  user: {
    userId: number;
    fullName: string;
    email: string;
    phone: string;
    role: string;
    gender: string;
    avatar?: string | null;
  };

  service: {
    name: string;
  };

  feedback?: any;
  followUps?: any[];
  payments?: any[];
}
