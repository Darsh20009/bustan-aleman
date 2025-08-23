import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BookOpen } from "lucide-react";

interface TafsirViewProps {
  text: string;
  tafsir?: string;
  ayahNumber: number;
}

const TafsirView = ({ text, tafsir, ayahNumber }: TafsirViewProps) => {
  const [activeTab, setActiveTab] = useState<string>("quran");
  
  // تحويل الرقم إلى أرقام عربية
  const toArabicNumeral = (num: number): string => {
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return num.toString().split('').map(digit => arabicNumerals[parseInt(digit)]).join('');
  };

  return (
    <div className="my-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-between items-center mb-2">
          <TabsList className="grid grid-cols-2 w-60">
            <TabsTrigger value="quran">القرآن</TabsTrigger>
            <TabsTrigger value="tafsir">التفسير</TabsTrigger>
          </TabsList>
          <div className="verse-end mr-2">{toArabicNumeral(ayahNumber)}</div>
        </div>
        
        <TabsContent value="quran" className="mt-0">
          <Card>
            <CardContent className="pt-4">
              <p className="quran-text text-xl">{text}</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tafsir" className="mt-0">
          <Card>
            <CardContent className="pt-4">
              {tafsir ? (
                <div className="text-base leading-relaxed">
                  <div className="flex items-center text-primary mb-2">
                    <BookOpen className="h-4 w-4 mr-2" /> 
                    <span className="font-bold">تفسير الميسر:</span>
                  </div>
                  <p>{tafsir}</p>
                </div>
              ) : (
                <p className="text-center text-gray-500">التفسير غير متوفر</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TafsirView;