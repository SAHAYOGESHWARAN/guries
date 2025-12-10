import React, { useState } from 'react';
import CircularScore from '../components/CircularScore';

const ScoreDemoView: React.FC = () => {
    const [demoScore, setDemoScore] = useState(77);

    return (
        <div className="h-full flex flex-col w-full p-6 overflow-y-auto">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Circular Score Component Demo</h1>
                    <p className="text-slate-600">Interactive circular progress indicators for quality scores</p>
                </div>

                {/* Interactive Demo */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                    <h2 className="text-xl font-bold text-slate-900 mb-6">Interactive Demo</h2>

                    <div className="flex flex-col items-center space-y-6">
                        <CircularScore
                            score={demoScore}
                            label="On-page score"
                            size="lg"
                            showEmbedButton={true}
                        />

                        <div className="w-full max-w-md">
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Adjust Score: {demoScore}%
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={demoScore}
                                onChange={(e) => setDemoScore(parseInt(e.target.value))}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between text-xs text-slate-500 mt-1">
                                <span>0%</span>
                                <span>50%</span>
                                <span>100%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Size Variations */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                    <h2 className="text-xl font-bold text-slate-900 mb-6">Size Variations</h2>

                    <div className="flex justify-center items-end gap-8">
                        <CircularScore score={85} label="Small" size="sm" />
                        <CircularScore score={72} label="Medium" size="md" />
                        <CircularScore score={91} label="Large" size="lg" showEmbedButton={true} />
                    </div>
                </div>

                {/* Score Ranges */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                    <h2 className="text-xl font-bold text-slate-900 mb-6">Score Color Ranges</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <CircularScore score={45} label="Needs Improvement" size="md" />
                            <p className="text-sm text-red-600 font-medium mt-2">0-59% (Red)</p>
                        </div>
                        <div className="text-center">
                            <CircularScore score={75} label="Good" size="md" />
                            <p className="text-sm text-yellow-600 font-medium mt-2">60-79% (Orange)</p>
                        </div>
                        <div className="text-center">
                            <CircularScore score={92} label="Excellent" size="md" />
                            <p className="text-sm text-green-600 font-medium mt-2">80-100% (Green)</p>
                        </div>
                    </div>
                </div>

                {/* Use Cases */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                    <h2 className="text-xl font-bold text-slate-900 mb-6">Asset Quality Scores</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <CircularScore score={88} label="SEO Score" size="md" />
                            <p className="text-sm text-slate-600 mt-2">Search Engine Optimization</p>
                        </div>
                        <div className="text-center">
                            <CircularScore score={94} label="Grammar Score" size="md" />
                            <p className="text-sm text-slate-600 mt-2">Grammar & Readability</p>
                        </div>
                        <div className="text-center">
                            <CircularScore score={76} label="QC Score" size="md" />
                            <p className="text-sm text-slate-600 mt-2">Quality Control Review</p>
                        </div>
                    </div>
                </div>

                {/* Implementation Code */}
                <div className="bg-slate-900 rounded-xl p-6">
                    <h2 className="text-xl font-bold text-white mb-4">Usage Example</h2>
                    <pre className="text-green-400 text-sm overflow-x-auto">
                        {`<CircularScore 
    score={77} 
    label="On-page score" 
    size="md"
    showEmbedButton={true}
/>`}
                    </pre>
                </div>

                {/* Props Documentation */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                    <h2 className="text-xl font-bold text-slate-900 mb-6">Component Props</h2>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-200">
                                    <th className="text-left py-2 font-bold text-slate-700">Prop</th>
                                    <th className="text-left py-2 font-bold text-slate-700">Type</th>
                                    <th className="text-left py-2 font-bold text-slate-700">Default</th>
                                    <th className="text-left py-2 font-bold text-slate-700">Description</th>
                                </tr>
                            </thead>
                            <tbody className="text-slate-600">
                                <tr className="border-b border-slate-100">
                                    <td className="py-2 font-mono text-purple-600">score</td>
                                    <td className="py-2">number</td>
                                    <td className="py-2">-</td>
                                    <td className="py-2">Score value (0-100)</td>
                                </tr>
                                <tr className="border-b border-slate-100">
                                    <td className="py-2 font-mono text-purple-600">label</td>
                                    <td className="py-2">string</td>
                                    <td className="py-2">-</td>
                                    <td className="py-2">Label text below the circle</td>
                                </tr>
                                <tr className="border-b border-slate-100">
                                    <td className="py-2 font-mono text-purple-600">size</td>
                                    <td className="py-2">'sm' | 'md' | 'lg'</td>
                                    <td className="py-2">'md'</td>
                                    <td className="py-2">Size of the circular indicator</td>
                                </tr>
                                <tr className="border-b border-slate-100">
                                    <td className="py-2 font-mono text-purple-600">showEmbedButton</td>
                                    <td className="py-2">boolean</td>
                                    <td className="py-2">false</td>
                                    <td className="py-2">Show embed widget button</td>
                                </tr>
                                <tr>
                                    <td className="py-2 font-mono text-purple-600">className</td>
                                    <td className="py-2">string</td>
                                    <td className="py-2">''</td>
                                    <td className="py-2">Additional CSS classes</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScoreDemoView;