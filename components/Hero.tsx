'use client';

import { ArrowRight, Globe, Shield, TrendingUp, Zap } from 'lucide-react';

import { useWallet } from '@/context/WalletContext';

export default function Hero() {
  const { isConnected } = useWallet();

  return (
    <div className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10 rounded-3xl"></div>
      
      <div className="relative px-6 py-16 sm:py-24">
        <div className="text-center">
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
            Decentralized
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {' '}Microlending
            </span>
            <br />
            for Everyone
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Connect borrowers with lenders through blockchain technology. 
            Fast, transparent, and accessible financial services powered by Stellar.
          </p>

          {!isConnected && (
            <div className="flex justify-center mb-12">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 max-w-md">
                <p className="text-amber-800 text-sm">
                  👝 Connect your Freighter wallet to get started with lending and borrowing
                </p>
              </div>
            </div>
          )}

          {/* Feature highlights */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="stats-card text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure & Transparent</h3>
              <p className="text-gray-600">All transactions are recorded on the Stellar blockchain for complete transparency and security.</p>
            </div>

            <div className="stats-card text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Fast & Efficient</h3>
              <p className="text-gray-600">Quick loan processing and instant settlements with low fees on the Stellar network.</p>
            </div>

            <div className="stats-card text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Globe className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Global Access</h3>
              <p className="text-gray-600">Access to financial services regardless of location or traditional banking infrastructure.</p>
            </div>
          </div>

          {/* Quick stats */}
          <div className="mt-16 bg-white/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">5%-50%</div>
                <div className="text-sm text-gray-600">Interest Rate Range</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">30-365</div>
                <div className="text-sm text-gray-600">Days Duration</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">1-1000</div>
                <div className="text-sm text-gray-600">XLM Loan Range</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">1%</div>
                <div className="text-sm text-gray-600">Platform Fee</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}