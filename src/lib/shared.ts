export const options2 = { style: 'currency', currency: 'USD' };
export const numberFormat2 = new Intl.NumberFormat('en-US', options2);

export class ApiError extends Error {
  constructor(
    public responseStatus: number,
    public message: string,
    public errors?: string[] | string,
    public fields?: Record<string, string>,
  ) {
    super(message);
  }
}

export type UserCar = {
  id: string;
  model: string;
  make: string;
  price: number;
};

export type UserInfo = {
  created_at: string;
  id: string;
  user_id: string;
  carsOwned: UserCar[];
  carsWanted: UserCar[];
};

export async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    method: 'GET',
    cache: 'no-cache',
  });
  if (response.ok) {
    return await response.json();
  } else if (response.status === 417) {
    const serverError = await response.json();
    throw new ApiError(response.status, serverError.message, serverError.errors);
  } else {
    throw new ApiError(response.status, response.statusText);
  }
}
