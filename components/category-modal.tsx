"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CheckCircle, Users, Wrench, GraduationCap } from "lucide-react"

interface CategoryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CategoryModal({ open, onOpenChange }: CategoryModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">What counts as Priority vs. Supplementary?</DialogTitle>
          <DialogDescription>
            Understanding PEO's CPD categories to help you classify your activities correctly
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-8 mt-6">
          {/* Priority Column */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Wrench className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-blue-900">Priority Activities</h3>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Activities directly related to your engineering practice and technical competence, but not including professional engineering pactice
            </p>

            <div className="space-y-3">
              {[
                "Technical courses and workshops",
                "Engineering conferences and seminars",
                "Professional engineering work experience",
                "Technical presentations and publications",
                "Engineering research and development",
                "Technical committee participation",
                "Mentoring junior engineers",
                "Engineering design reviews",
              ].map((item, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Supplementary Column */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Supplementary Activities</h3>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Activities that enhance your professional effectiveness but aren't directly technical
            </p>

            <div className="space-y-3">
              {[
                "Management and leadership training",
                "Communication and presentation skills",
                "Business and entrepreneurship courses",
                "Health and safety training",
                "Environmental awareness programs",
                "Community volunteer work",
                "Professional association activities",
                "General interest educational activities",
              ].map((item, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start space-x-2">
            <GraduationCap className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">PEO Requirements</h4>
              <p className="text-sm text-blue-800">
                Note: For the most up-to-date information on what qualifies as Priority and Supplementary CPD activities, please refer to the official PEO guidelines at peo.on.ca/licence-holders/mandatory-cpd. CPDTracker's classifications are provided as a general reference and may not reflect the latest requirements. It is the user’s responsibility to ensure compliance with PEO standards.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
