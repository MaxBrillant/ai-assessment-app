export async function getEnvVariable(name: string) {
  return process.env[name];
}
