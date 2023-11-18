// import { is_promise } from 'svelte/internal';
// import { writable, type Readable, type Writable } from 'svelte/store';

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

function compactRequestObject(
  data: Record<string, string | number | boolean | null | undefined>,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key in data) {
    const value = data[key];
    if (typeof value === 'string') {
      out[key] = value;
    } else if (typeof value === 'number') {
      out[key] = '' + value;
    } else if (typeof value === 'boolean') {
      out[key] = `${value}`;
    }
  }
  return out;
}
function compactRequestArray(
  data: [string, string | number | boolean | null | undefined][],
): [string, string][] {
  const out: [string, string][] = [];
  for (const [key, value] of data) {
    if (typeof value === 'string') {
      out.push([key, value]);
    } else if (typeof value === 'number') {
      out.push([key, '' + value]);
    } else if (typeof value === 'boolean') {
      out.push([key, value.valueOf.toString()]);
    }
  }
  return out;
}

export async function getJson<T>(url: string): Promise<any> {
  const response = await fetch(url, {
    method: 'GET',
    cache: 'no-cache',
  });
  let thing: any;
  //   thing = await response.body;
  console.log(response);
  //   const thinger: string = await response.json
  //   console.log(JSON.parse(thinger));
  if (response.ok) {
    // return await response.body;
    return await response.json();
  } else if (response.status === 417) {
    const serverError = await response.json();
    throw new ApiError(response.status, serverError.message, serverError.errors);
  } else {
    throw new ApiError(response.status, response.statusText);
  }
}
