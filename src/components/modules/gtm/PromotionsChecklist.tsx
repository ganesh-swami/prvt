import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectPromotionsChecklist,
  setPromotionsNotes,
  togglePromotionItem,
} from "@/store/slices/gtmPlannerSlice";

export const PromotionsChecklist: React.FC = () => {
  const dispatch = useAppDispatch();
  const promotions = useAppSelector(selectPromotionsChecklist);

  const promotionItems = [
    "Demos + tutorials",
    "Transparency on how you made the product",
    "Packaging sneak peek",
    "Specs and features",
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-teal-800">
          Promotions
        </CardTitle>
        <p className="text-gray-600">
          Finally, it's time to promote your product and educate your audience.
          Select the solutions you will use to market your product and leave
          notes about key strategies.
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Notes Section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Notes:</h4>
              <p className="text-sm text-gray-600 mb-3">[Type here]</p>
              <Textarea
                placeholder="Enter your promotion strategy notes here..."
                value={promotions.notes}
                onChange={(e) => dispatch(setPromotionsNotes(e.target.value))}
                className="min-h-[100px]"
              />
            </div>
          </div>

          {/* Promotion Options */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">
              Select your promotion strategies:
            </h4>
            {promotionItems.map((item, index) => (
              <div
                key={index}
                className="flex items-start space-x-3 p-3 bg-white border border-gray-200 rounded-lg"
              >
                <Checkbox
                  id={`promo-${index}`}
                  checked={promotions.selectedItems[item] || false}
                  onCheckedChange={(checked) =>
                    dispatch(
                      togglePromotionItem({ item, checked: checked as boolean })
                    )
                  }
                  className="mt-0.5"
                />
                <label
                  htmlFor={`promo-${index}`}
                  className="text-sm font-medium text-gray-900 cursor-pointer flex-1"
                >
                  {item}
                </label>
              </div>
            ))}
          </div>

          {/* Additional Promotion Ideas */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">
              Additional Promotion Ideas:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-800">
              <ul className="space-y-1">
                <li>• Social media campaigns</li>
                <li>• Influencer partnerships</li>
                <li>• Content marketing</li>
                <li>• Email marketing</li>
                <li>• Webinars and events</li>
              </ul>
              <ul className="space-y-1">
                <li>• Press releases</li>
                <li>• Customer testimonials</li>
                <li>• Free trials or samples</li>
                <li>• Referral programs</li>
                <li>• Partnership marketing</li>
              </ul>
            </div>
          </div>

          {/* Strategy Framework */}
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <h4 className="font-medium text-yellow-900 mb-2">
              Promotion Strategy Framework:
            </h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>
                • <strong>Educate:</strong> Help customers understand your
                product
              </li>
              <li>
                • <strong>Demonstrate:</strong> Show your product in action
              </li>
              <li>
                • <strong>Build Trust:</strong> Share behind-the-scenes content
              </li>
              <li>
                • <strong>Create Urgency:</strong> Limited-time offers or
                exclusive access
              </li>
              <li>
                • <strong>Social Proof:</strong> Customer reviews and case
                studies
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
