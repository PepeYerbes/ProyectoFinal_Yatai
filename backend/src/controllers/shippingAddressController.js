import ShippingAddress from '../models/shippingAddress.js';

// Crear una nueva dirección de envío
export const createShippingAddress = async (req, res, next) => {
  try {
    const { name, address, city, state, postalCode, country, phone, isDefault, addressType } = req.body;
    const user = req.user.userId;
    const newAddress = new ShippingAddress({
      user,
      name,
      address,
      city,
      state,
      postalCode,
      country,
      phone,
      isDefault,
      addressType
    });
    await newAddress.save();
    res.status(201).json({ message: 'Dirección creada correctamente', address: newAddress });
  } catch (error) {
    next(error);
  }
};

// Obtener todas las direcciones del usuario
export const getUserAddresses = async (req, res, next) => {
  try {
    const user = req.user.userId;
    const addresses = await ShippingAddress.find({ user });
    res.status(200).json({ message: 'Direcciones obtenidas', addresses });
  } catch (error) {
    next(error);
  }
};

// Obtener una dirección por ID
export const getAddressById = async (req, res, next) => {
  try {
    const { addressId } = req.params;
    const address = await ShippingAddress.findById(addressId);
    if (!address) {
      return res.status(404).json({ message: 'Dirección no encontrada' });
    }
    res.status(200).json({ message: 'Dirección encontrada', address });
  } catch (error) {
    next(error);
  }
};

// Obtener la dirección por defecto
export const getDefaultAddress = async (req, res, next) => {
  try {
    const user = req.user.userId;
    const address = await ShippingAddress.findOne({ user, isDefault: true });
    res.status(200).json({ message: 'Dirección por defecto', address });
  } catch (error) {
    next(error);
  }
};

// Actualizar una dirección
export const updateShippingAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;
    const update = req.body;
    const address = await ShippingAddress.findByIdAndUpdate(addressId, update, { new: true });
    if (!address) {
      return res.status(404).json({ message: 'Dirección no encontrada' });
    }
    res.status(200).json({ message: 'Dirección actualizada', address });
  } catch (error) {
    next(error);
  }
};

// Marcar dirección como default
export const setDefaultAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;
    const user = req.user.userId;
    await ShippingAddress.updateMany({ user }, { isDefault: false });
    const address = await ShippingAddress.findByIdAndUpdate(addressId, { isDefault: true }, { new: true });
    if (!address) {
      return res.status(404).json({ message: 'Dirección no encontrada' });
    }
    res.status(200).json({ message: 'Dirección marcada como predeterminada', address });
  } catch (error) {
    next(error);
  }
};

// Eliminar una dirección
export const deleteShippingAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;
    const address = await ShippingAddress.findByIdAndDelete(addressId);
    if (!address) {
      return res.status(404).json({ message: 'Dirección no encontrada' });
    }
    res.status(200).json({ message: 'Dirección eliminada' });
  } catch (error) {
    next(error);
  }
};
