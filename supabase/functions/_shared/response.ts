function respond(status = 200, data = {}, errors: Array<Error> = []) {
  const response = {
    status: status,
    data: data,
    errors: errors,
  };

  return new Response(JSON.stringify(response), {
    headers: { "Content-Type": "application/json" },
  });
}

class Error {
  code?: number = 0;
  message?: string = "";
}

export { respond };
export { Error };
