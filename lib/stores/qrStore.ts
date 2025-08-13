import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface QRToken {
  id: string
  token: string
  userId: string
  clubId: string
  expiresAt: Date
  createdAt: Date
}

interface AttendanceRecord {
  id: string
  userId: string
  clubId: string
  tokenId: string
  verifiedAt: Date
  status: 'verified' | 'expired' | 'invalid'
}

interface QRState {
  currentToken: QRToken | null
  attendanceRecords: AttendanceRecord[]
  isGenerating: boolean
  isVerifying: boolean
  error: string | null
  
  // Actions
  generateToken: (clubId: string) => Promise<void>
  verifyToken: (token: string, clubId: string) => Promise<boolean>
  clearToken: () => void
  addAttendanceRecord: (record: AttendanceRecord) => void
  setError: (error: string | null) => void
  clearError: () => void
}

export const useQRStore = create<QRState>()(
  persist(
    (set) => ({
      currentToken: null,
      attendanceRecords: [],
      isGenerating: false,
      isVerifying: false,
      error: null,

      generateToken: async (clubId: string) => {
        try {
          set({ isGenerating: true, error: null })
          
          // Simular generación de token (aquí iría tu lógica real)
          const token: QRToken = {
            id: crypto.randomUUID(),
            token: Math.random().toString(36).substring(2, 15),
            userId: 'current-user-id', // Esto vendría del auth store
            clubId,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
            createdAt: new Date()
          }
          
          set({ 
            currentToken: token,
            isGenerating: false 
          })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Error al generar token',
            isGenerating: false 
          })
        }
      },

      verifyToken: async (token: string, clubId: string) => {
        try {
          set({ isVerifying: true, error: null })
          
          // Simular verificación (aquí iría tu lógica real)
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          const isValid = token.length > 0 // Lógica simple de validación
          
          if (isValid) {
            const record: AttendanceRecord = {
              id: crypto.randomUUID(),
              userId: 'verified-user-id', // Esto vendría del auth store
              clubId,
              tokenId: 'token-id',
              verifiedAt: new Date(),
              status: 'verified'
            }
            
            set(state => ({
              attendanceRecords: [...state.attendanceRecords, record],
              isVerifying: false
            }))
            
            return true
          } else {
            set({ 
              error: 'Token inválido',
              isVerifying: false 
            })
            return false
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Error al verificar token',
            isVerifying: false 
          })
          return false
        }
      },

      clearToken: () => set({ currentToken: null }),
      
      addAttendanceRecord: (record: AttendanceRecord) => {
        set(state => ({
          attendanceRecords: [...state.attendanceRecords, record]
        }))
      },

      setError: (error: string | null) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'qr-storage',
      partialize: (state) => ({ 
        attendanceRecords: state.attendanceRecords 
      }),
    }
  )
)
