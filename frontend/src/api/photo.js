// Resize before sending so a phone photo does not become a large API payload.
export async function prepareProfilePhoto(file) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error('Choose a JPEG, PNG or WebP image.')
  }
  if (file.size > 5 * 1024 * 1024) throw new Error('Choose an image smaller than 5 MB.')
  const url = URL.createObjectURL(file)
  try {
    const image = new Image()
    image.src = url
    await image.decode()
    const canvas = document.createElement('canvas')
    canvas.width = 384
    canvas.height = 384
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Image processing is unavailable in this browser.')
    const side = Math.min(image.naturalWidth, image.naturalHeight)
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, 384, 384)
    context.drawImage(image, (image.naturalWidth - side) / 2, (image.naturalHeight - side) / 2,
      side, side, 0, 0, 384, 384)
    return canvas.toDataURL('image/jpeg', 0.85)
  } catch {
    throw new Error('Could not read this photo. Try another JPEG, PNG or WebP image.')
  } finally {
    URL.revokeObjectURL(url)
  }
}
