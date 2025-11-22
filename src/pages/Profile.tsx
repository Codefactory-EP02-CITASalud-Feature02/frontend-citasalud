import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Edit,
  Save,
  X,
  Camera,
  Heart,
  Bell,
  FileText,
  AlertCircle,
  Upload,
  Trash2
} from 'lucide-react';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    // Personal
    firstName: user?.name?.split(' ')[0] || 'Maria',
    lastName: user?.name?.split(' ').slice(1).join(' ') || 'García',
    documentType: 'Cédula de Ciudadanía',
    documentNumber: '1234567888',
    email: user?.email || 'maria@example.com',
    phone: '+57 300 1234567',
    birthDate: '1990-05-15',
    gender: 'Femenino',
    address: 'Calle 123 #45-67',
    city: 'Bogotá',
    emergencyContactName: 'Ana García',
    emergencyContactPhone: '+57 301 987 6543',
    
    // Medical
    bloodType: 'O+',
    allergies: 'Penicilina, Polen',
    medicalHistory: 'Hipertensión controlada, Diabetes tipo 2',
    currentMedications: 'Metformina 500mg, Losartán 50mg',
    
    // Notifications
    emailNotifications: true,
    smsNotifications: false,
    whatsappNotifications: true,
    
    // Consent
    dataProcessingConsent: true,
    medicalDataConsent: true,
    communicationsConsent: false
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateFile = (file: File): string | null => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      return 'Solo se permiten archivos JPG y PNG';
    }

    if (file.size > maxSize) {
      return 'El tamaño máximo permitido es 5MB';
    }

    return null;
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateFile(file);
    if (error) {
      setFileError(error);
      setAvatarFile(null);
      setAvatarPreview(null);
      return;
    }

    setFileError(null);
    setAvatarFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = () => {
    // Validate required fields
    if (!formData.firstName || !formData.lastName) {
      toast({
        title: "Error",
        description: "Por favor complete todos los campos obligatorios",
        variant: "destructive"
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Error",
        description: "Por favor ingrese un correo electrónico válido",
        variant: "destructive"
      });
      return;
    }

    // Here you would typically save to API
    // Simulate API call
    setIsEditing(false);
    
    toast({
      title: "Perfil actualizado exitosamente",
      description: "Sus cambios han sido guardados correctamente",
    });
  };

  const handleCancel = () => {
    // Reset form data and avatar
    setFormData({
      firstName: user?.name?.split(' ')[0] || 'Maria',
      lastName: user?.name?.split(' ').slice(1).join(' ') || 'García',
      documentType: 'Cédula de Ciudadanía',
      documentNumber: '1234567888',
      email: user?.email || 'maria@example.com',
      phone: '+57 300 1234567',
      birthDate: '1990-05-15',
      gender: 'Femenino',
      address: 'Calle 123 #45-67',
      city: 'Bogotá',
      emergencyContactName: 'Ana García',
      emergencyContactPhone: '+57 301 987 6543',
      bloodType: 'O+',
      allergies: 'Penicilina, Polen',
      medicalHistory: 'Hipertensión controlada, Diabetes tipo 2',
      currentMedications: 'Metformina 500mg, Losartán 50mg',
      emailNotifications: true,
      smsNotifications: false,
      whatsappNotifications: true,
      dataProcessingConsent: true,
      medicalDataConsent: true,
      communicationsConsent: false
    });
    setAvatarFile(null);
    setAvatarPreview(null);
    setFileError(null);
    setIsEditing(false);
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'doctor':
        return 'Doctor';
      case 'patient':
        return 'Paciente';
      case 'admin':
        return 'Administrador';
      case 'nurse':
        return 'Enfermero';
      default:
        return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'doctor':
        return 'medical-blue';
      case 'patient':
        return 'medical-green';
      case 'admin':
        return 'medical-purple';
      case 'nurse':
        return 'medical-orange';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Mi Perfil
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gestione su información personal y preferencias médicas.
            </p>
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button onClick={handleCancel} variant="outline">
                  Cancelar
                </Button>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar Perfil
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Avatar and Basic Info Card */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="relative">
              <Avatar className="w-20 h-20">
                <AvatarImage 
                  src={avatarPreview || "/placeholder-avatar.jpg"} 
                  alt={`${formData.firstName} ${formData.lastName}`} 
                />
                <AvatarFallback className="text-xl">
                  {formData.firstName[0]}{formData.lastName[0]}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <>
                  <Button
                    size="sm"
                    variant="default"
                    className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full p-0"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                  {avatarPreview && (
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-6 w-6 rounded-full p-0"
                      onClick={handleRemoveAvatar}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold">
                {formData.firstName} {formData.lastName}
              </h2>
              <p className="text-sm text-muted-foreground">{formData.email}</p>
              <p className="text-sm text-muted-foreground">CC: {formData.documentNumber}</p>
              <Badge 
                variant="outline"
                className="mt-2"
              >
                Rol: {getRoleText(user?.role || 'patient')}
              </Badge>
            </div>
          </div>

          {/* File upload helper text */}
          {isEditing && (
            <div className="mt-4">
              {fileError ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{fileError}</AlertDescription>
                </Alert>
              ) : (
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                  <Upload className="h-3 w-3" />
                  Formatos permitidos: JPG, PNG. Tamaño máximo: 5MB
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs for different sections */}
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal">
            <User className="h-4 w-4 mr-2" />
            Personal
          </TabsTrigger>
          <TabsTrigger value="medical">
            <Heart className="h-4 w-4 mr-2" />
            Médico
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notificaciones
          </TabsTrigger>
          <TabsTrigger value="consent">
            <FileText className="h-4 w-4 mr-2" />
            Consentimientos
          </TabsTrigger>
        </TabsList>

        {/* Personal Information Tab */}
        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
              <CardDescription>
                Actualice su información personal y de contacto
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nombre *</Label>
                  {isEditing ? (
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder="María"
                    />
                  ) : (
                    <p className="text-sm py-2">{formData.firstName}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName">Apellidos</Label>
                  {isEditing ? (
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      placeholder="García"
                    />
                  ) : (
                    <p className="text-sm py-2">{formData.lastName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="documentType">Tipo de Documento</Label>
                  {isEditing ? (
                    <Select
                      value={formData.documentType}
                      onValueChange={(value) => handleInputChange('documentType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cédula de Ciudadanía">Cédula de Ciudadanía</SelectItem>
                        <SelectItem value="Tarjeta de Identidad">Tarjeta de Identidad</SelectItem>
                        <SelectItem value="Pasaporte">Pasaporte</SelectItem>
                        <SelectItem value="Cédula de Extranjería">Cédula de Extranjería</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm py-2">{formData.documentType}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="documentNumber">Número de Documento *</Label>
                  {isEditing ? (
                    <Input
                      id="documentNumber"
                      value={formData.documentNumber}
                      onChange={(e) => handleInputChange('documentNumber', e.target.value)}
                      placeholder="1234567888"
                    />
                  ) : (
                    <p className="text-sm py-2 text-primary font-medium">{formData.documentNumber}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    <Mail className="h-4 w-4 inline mr-1" />
                    Email
                  </Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="maria@example.com"
                    />
                  ) : (
                    <p className="text-sm py-2">{formData.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">
                    <Phone className="h-4 w-4 inline mr-1" />
                    Teléfono
                  </Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+57 300 1234567"
                    />
                  ) : (
                    <p className="text-sm py-2">{formData.phone}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthDate">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Fecha de Nacimiento
                  </Label>
                  {isEditing ? (
                    <Input
                      id="birthDate"
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => handleInputChange('birthDate', e.target.value)}
                    />
                  ) : (
                    <p className="text-sm py-2">{formData.birthDate}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Género</Label>
                  {isEditing ? (
                    <Select
                      value={formData.gender}
                      onValueChange={(value) => handleInputChange('gender', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Masculino">Masculino</SelectItem>
                        <SelectItem value="Femenino">Femenino</SelectItem>
                        <SelectItem value="Otro">Otro</SelectItem>
                        <SelectItem value="Prefiero no decir">Prefiero no decir</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm py-2">{formData.gender}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">
                    <MapPin className="h-4 w-4 inline mr-1" />
                    Dirección
                  </Label>
                  {isEditing ? (
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Calle 123 #45-67"
                    />
                  ) : (
                    <p className="text-sm py-2">{formData.address}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Ciudad</Label>
                  {isEditing ? (
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="Bogotá"
                    />
                  ) : (
                    <p className="text-sm py-2">{formData.city}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyContactName">Contacto de Emergencia</Label>
                  {isEditing ? (
                    <Input
                      id="emergencyContactName"
                      value={formData.emergencyContactName}
                      onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                      placeholder="Ana García"
                    />
                  ) : (
                    <p className="text-sm py-2">{formData.emergencyContactName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyContactPhone">Teléfono de Emergencia</Label>
                  {isEditing ? (
                    <Input
                      id="emergencyContactPhone"
                      value={formData.emergencyContactPhone}
                      onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                      placeholder="+57 301 987 6543"
                    />
                  ) : (
                    <p className="text-sm py-2">{formData.emergencyContactPhone}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Medical Information Tab */}
        <TabsContent value="medical">
          <Card>
            <CardHeader>
              <CardTitle>Información Médica</CardTitle>
              <CardDescription>
                Historial médico, alergias y medicamentos actuales
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bloodType">Tipo de Sangre</Label>
                  {isEditing ? (
                    <Select
                      value={formData.bloodType}
                      onValueChange={(value) => handleInputChange('bloodType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm py-2">{formData.bloodType}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="allergies">Alergias</Label>
                  {isEditing ? (
                    <Input
                      id="allergies"
                      value={formData.allergies}
                      onChange={(e) => handleInputChange('allergies', e.target.value)}
                      placeholder="Penicilina, Polen"
                    />
                  ) : (
                    <p className="text-sm py-2">{formData.allergies}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="medicalHistory">Historial Médico</Label>
                {isEditing ? (
                  <Textarea
                    id="medicalHistory"
                    value={formData.medicalHistory}
                    onChange={(e) => handleInputChange('medicalHistory', e.target.value)}
                    rows={4}
                    placeholder="Ingrese su historial médico relevante"
                  />
                ) : (
                  <p className="text-sm py-2 whitespace-pre-wrap">{formData.medicalHistory}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentMedications">Medicamentos Actuales</Label>
                {isEditing ? (
                  <Textarea
                    id="currentMedications"
                    value={formData.currentMedications}
                    onChange={(e) => handleInputChange('currentMedications', e.target.value)}
                    rows={4}
                    placeholder="Ingrese los medicamentos que está tomando actualmente"
                  />
                ) : (
                  <p className="text-sm py-2 whitespace-pre-wrap">{formData.currentMedications}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Preferencias de Notificaciones</CardTitle>
              <CardDescription>
                Configure cómo desea recibir notificaciones sobre sus citas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <Label htmlFor="emailNotifications" className="font-medium">
                    Notificaciones por Correo Electrónico
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Reciba recordatorios y actualizaciones por email
                  </p>
                </div>
                <Checkbox
                  id="emailNotifications"
                  checked={formData.emailNotifications}
                  onCheckedChange={(checked) => 
                    handleInputChange('emailNotifications', checked as boolean)
                  }
                  disabled={!isEditing}
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <Label htmlFor="smsNotifications" className="font-medium">
                    Notificaciones por SMS
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Reciba mensajes de texto con recordatorios
                  </p>
                </div>
                <Checkbox
                  id="smsNotifications"
                  checked={formData.smsNotifications}
                  onCheckedChange={(checked) => 
                    handleInputChange('smsNotifications', checked as boolean)
                  }
                  disabled={!isEditing}
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <Label htmlFor="whatsappNotifications" className="font-medium">
                    Notificaciones por WhatsApp
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Reciba mensajes por WhatsApp
                  </p>
                </div>
                <Checkbox
                  id="whatsappNotifications"
                  checked={formData.whatsappNotifications}
                  onCheckedChange={(checked) => 
                    handleInputChange('whatsappNotifications', checked as boolean)
                  }
                  disabled={!isEditing}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Consent Tab */}
        <TabsContent value="consent">
          <Card>
            <CardHeader>
              <CardTitle>Consentimientos</CardTitle>
              <CardDescription>
                Administre sus consentimientos para el tratamiento de datos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 py-2">
                <Checkbox
                  id="dataProcessingConsent"
                  checked={formData.dataProcessingConsent}
                  onCheckedChange={(checked) => 
                    handleInputChange('dataProcessingConsent', checked as boolean)
                  }
                  disabled={!isEditing}
                  className="mt-1"
                />
                <div className="space-y-0.5">
                  <Label htmlFor="dataProcessingConsent" className="font-medium cursor-pointer">
                    Tratamiento de Datos Personales
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Autorizo el tratamiento de mis datos personales conforme a la política de privacidad 
                    y protección de datos de la institución médica.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 py-2">
                <Checkbox
                  id="medicalDataConsent"
                  checked={formData.medicalDataConsent}
                  onCheckedChange={(checked) => 
                    handleInputChange('medicalDataConsent', checked as boolean)
                  }
                  disabled={!isEditing}
                  className="mt-1"
                />
                <div className="space-y-0.5">
                  <Label htmlFor="medicalDataConsent" className="font-medium cursor-pointer">
                    Uso de Información Médica
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Autorizo el uso de mi información médica para fines de diagnóstico, tratamiento 
                    y seguimiento de mi salud.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 py-2">
                <Checkbox
                  id="communicationsConsent"
                  checked={formData.communicationsConsent}
                  onCheckedChange={(checked) => 
                    handleInputChange('communicationsConsent', checked as boolean)
                  }
                  disabled={!isEditing}
                  className="mt-1"
                />
                <div className="space-y-0.5">
                  <Label htmlFor="communicationsConsent" className="font-medium cursor-pointer">
                    Comunicaciones Comerciales
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Acepto recibir comunicaciones sobre promociones, servicios adicionales y 
                    novedades de la institución.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;