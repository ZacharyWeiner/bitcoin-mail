export default class FileUtils {
    static async importFromPublic(fileName) {
      const response = await fetch(process.env.BASE_URL + fileName)
      return response.text()
    }
  }
  