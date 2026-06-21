export interface ContactPayload {
  name: string;
  email: string;
  phone_no: string;
  subject: string;
  message: string;
}

export interface ContactResponse {
  message: string;
  data: {
    id: number;
    name: string;
    email: string;
    phone_no: string;
    subject: string;
    message: string;
    created_at: string;
    updated_at: string;
  };
}
