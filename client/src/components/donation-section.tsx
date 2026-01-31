import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Heart, 
  Copy, 
  Check, 
  DollarSign,
  ExternalLink,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CryptoAddressProps {
  name: string;
  symbol: string;
  address: string;
  color: string;
}

function CryptoAddress({ name, symbol, address, color }: CryptoAddressProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      toast({
        title: "Address Copied",
        description: `${name} address copied to clipboard.`,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Please copy the address manually.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-4 rounded-lg border bg-card" data-testid={`crypto-${symbol.toLowerCase()}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
            style={{ backgroundColor: color }}
          >
            {symbol.charAt(0)}
          </div>
          <div>
            <p className="font-medium">{name}</p>
            <p className="text-xs text-muted-foreground">{symbol}</p>
          </div>
        </div>
        <Badge variant="outline">{symbol}</Badge>
      </div>
      <div className="flex gap-2">
        <Input 
          value={address} 
          readOnly 
          className="text-xs font-mono bg-muted/50"
          data-testid={`input-address-${symbol.toLowerCase()}`}
        />
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handleCopy}
          data-testid={`button-copy-${symbol.toLowerCase()}`}
        >
          {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}

const cryptoOptions: CryptoAddressProps[] = [
  {
    name: "Bitcoin",
    symbol: "BTC",
    address: "Coming soon",
    color: "#F7931A",
  },
  {
    name: "Ethereum",
    symbol: "ETH",
    address: "Coming soon",
    color: "#627EEA",
  },
  {
    name: "Monero",
    symbol: "XMR",
    address: "Coming soon",
    color: "#FF6600",
  },
];

export function DonationSection() {
  return (
    <section id="donate" className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Heart className="h-6 w-6 text-primary" />
            </div>
          </div>
          <Badge variant="outline" className="mb-4">Support Cerberus</Badge>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4" data-testid="text-donate-headline">
            Help Us Protect the Future
          </h2>
          <p className="text-lg text-muted-foreground">
            Your donations help us continue developing cutting-edge AI detection technology 
            and keep Cerberus accessible to everyone. Every contribution makes a difference.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Cryptocurrency Donations */}
            <Card data-testid="card-crypto-donations">
              <CardHeader>
                <CardTitle className="text-xl">Cryptocurrency</CardTitle>
                <CardDescription>
                  Donate using your preferred cryptocurrency
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {cryptoOptions.map((crypto) => (
                  <CryptoAddress key={crypto.symbol} {...crypto} />
                ))}
              </CardContent>
            </Card>

            {/* USD Donations */}
            <Card data-testid="card-usd-donations">
              <CardHeader>
                <CardTitle className="text-xl">US Dollar</CardTitle>
                <CardDescription>
                  Donate using traditional payment methods
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-6 rounded-lg border bg-gradient-to-br from-primary/5 to-primary/10 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="p-4 rounded-full bg-primary/20">
                      <DollarSign className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="font-semibold mb-2">Secure USD Donations</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Support Cerberus with a one-time or recurring donation via secure payment processing.
                  </p>
                  <div className="flex flex-col gap-3">
                    <Button className="w-full gap-2" size="lg" data-testid="button-donate-usd">
                      <Heart className="h-4 w-4" />
                      Donate with Card
                    </Button>
                    <Button variant="outline" className="w-full gap-2" data-testid="button-donate-paypal">
                      <ExternalLink className="h-4 w-4" />
                      Donate via PayPal
                    </Button>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    All donations are processed securely. You'll receive a confirmation email for your records.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Thank you note */}
          <div className="mt-12 text-center">
            <p className="text-muted-foreground">
              Thank you for supporting the fight against AI-generated threats. 
              Together, we can build a safer digital world.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
