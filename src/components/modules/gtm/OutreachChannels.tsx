import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectOutreachChannels,
  addOutreachChannel,
  removeOutreachChannel,
  updateOutreachChannel,
  updateOutreachChannelAsset,
} from "@/store/slices/gtmPlannerSlice";

export const OutreachChannels: React.FC = () => {
  const dispatch = useAppDispatch();
  const outreachChannels = useAppSelector(selectOutreachChannels);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-teal-800">
          Outreach channels
        </CardTitle>
        <p className="text-gray-600">
          Once you've decided on the best ways to educate your audience about
          your new product, start thinking about the best way to disseminate
          that information.
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-300 p-3 bg-yellow-400 text-black font-bold w-48">
                  Category
                </th>
                <th className="border border-gray-300 p-3 bg-teal-800 text-white font-bold">
                  Asset
                </th>
                <th className="border border-gray-300 p-3 bg-teal-800 text-white font-bold">
                  Channel(s)
                </th>
              </tr>
            </thead>
            <tbody>
              {outreachChannels.channels.map((channel) => (
                <tr key={channel.id}>
                  <td className="border border-gray-300 p-3 bg-gray-50 font-medium align-top">
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-start">
                        <Input
                          value={channel.category}
                          onChange={(e) =>
                            dispatch(
                              updateOutreachChannel({
                                id: channel.id,
                                field: "category",
                                value: e.target.value,
                              })
                            )
                          }
                          className="font-medium text-sm"
                          placeholder="Category name"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            dispatch(removeOutreachChannel(channel.id))
                          }
                          className="text-red-600 hover:text-red-800 p-1 ml-2 flex-shrink-0"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </td>
                  <td className="border border-gray-300 p-3 align-top">
                    <div className="space-y-2">
                      {channel.assets.map((asset, index) => (
                        <Input
                          key={index}
                          value={asset}
                          onChange={(e) =>
                            dispatch(
                              updateOutreachChannelAsset({
                                channelId: channel.id,
                                assetIndex: index,
                                value: e.target.value,
                              })
                            )
                          }
                          className="text-sm"
                          placeholder={`Asset ${index + 1}`}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="border border-gray-300 p-2">
                    <Textarea
                      placeholder="[Type here]"
                      value={channel.channelNotes}
                      onChange={(e) =>
                        dispatch(
                          updateOutreachChannel({
                            id: channel.id,
                            field: "channelNotes",
                            value: e.target.value,
                          })
                        )
                      }
                      className="min-h-[100px] text-sm border-0 p-1 resize-none"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4">
          <Button
            onClick={() => dispatch(addOutreachChannel())}
            variant="outline"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Channel Category
          </Button>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">
              Digital Channels:
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Website and landing pages</li>
              <li>• Social media platforms</li>
              <li>• Email marketing</li>
              <li>• Search engine marketing</li>
              <li>• Content marketing blogs</li>
              <li>• Online advertising</li>
            </ul>
          </div>

          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">
              Traditional Channels:
            </h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Trade shows and events</li>
              <li>• Print advertising</li>
              <li>• Direct mail campaigns</li>
              <li>• Public relations</li>
              <li>• Sales team outreach</li>
              <li>• Partner channels</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
